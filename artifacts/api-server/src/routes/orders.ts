import { randomUUID } from "node:crypto";
import { Router, type IRouter } from "express";
import { PlaceOrderBody, PlaceOrderResponse } from "@workspace/api-zod";
import { db, ordersTable, orderItemsTable } from "@workspace/db";

const router: IRouter = Router();

// Prices are authoritative on the server and stored in fils (1/1000 KWD).
const products = new Map([
  [1, { name: "65W GaN Fast Charger", priceFils: 6500 }],
  [2, { name: "Braided USB-C Cable 1m", priceFils: 2500 }],
  [3, { name: "Wireless Charging Pad", priceFils: 7900 }],
  [4, { name: "20,000mAh Power Bank", priceFils: 12500 }],
  [5, { name: "Wireless Earbuds", priceFils: 14900 }],
  [6, { name: "Shockproof Phone Case", priceFils: 3500 }],
  [7, { name: "Foldable Laptop Stand", priceFils: 9900 }],
  [8, { name: "Car Phone Mount", priceFils: 4500 }],
]);

type OrderLine = {
  productId: number;
  productName: string;
  quantity: number;
  unitPriceFils: number;
  lineTotalFils: number;
};

router.post("/orders", async (req, res): Promise<void> => {
  const parsed = PlaceOrderBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Please check your delivery details and order items." });
    return;
  }

  const { items, delivery, couponCode } = parsed.data;
  if (new Set(items.map((item) => item.productId)).size !== items.length) {
    res.status(400).json({ error: "Each product can only appear once in an order." });
    return;
  }

  const orderLines: OrderLine[] = [];
  for (const { productId, quantity } of items) {
    const product = products.get(productId);
    if (!product) {
      res.status(400).json({ error: "One or more products are no longer available." });
      return;
    }
    orderLines.push({
      productId,
      productName: product.name,
      quantity,
      unitPriceFils: product.priceFils,
      lineTotalFils: product.priceFils * quantity,
    });
  }

  const subtotalFils = orderLines.reduce((sum, line) => sum + line.lineTotalFils, 0);
  const discountFils = couponCode === "WASL10" ? Math.round(subtotalFils / 10) : 0;
  const totalFils = subtotalFils - discountFils;
  const cleanDelivery = {
    name: delivery.name.trim(),
    phone: delivery.phone.trim(),
    email: delivery.email?.trim() || null,
    governorate: delivery.governorate,
    area: delivery.area.trim(),
    block: delivery.block.trim(),
    street: delivery.street.trim(),
    building: delivery.building.trim(),
    instructions: delivery.instructions?.trim() || null,
  };
  if (
    cleanDelivery.name.length < 2
    || !cleanDelivery.area
    || !cleanDelivery.block
    || !cleanDelivery.street
    || !cleanDelivery.building
  ) {
    res.status(400).json({ error: "Please provide complete delivery details." });
    return;
  }

  const orderReference = `WASL-${randomUUID().toUpperCase()}`;
  try {
    await db.transaction(async (tx) => {
      const [order] = await tx.insert(ordersTable).values({
        orderReference,
        customerName: cleanDelivery.name,
        phone: `+965${cleanDelivery.phone}`,
        email: cleanDelivery.email,
        governorate: cleanDelivery.governorate,
        area: cleanDelivery.area,
        block: cleanDelivery.block,
        street: cleanDelivery.street,
        building: cleanDelivery.building,
        instructions: cleanDelivery.instructions,
        subtotalFils,
        discountFils,
        totalFils,
      }).returning({ id: ordersTable.id });

      await tx.insert(orderItemsTable).values(
        orderLines.map((line) => ({ ...line, orderId: order.id })),
      );
    });
  } catch (error) {
    req.log.error({ err: error }, "Unable to save order");
    res.status(500).json({ error: "We couldn't save your order. Please try again." });
    return;
  }

  res.status(201).json(PlaceOrderResponse.parse({
    orderReference,
    currency: "KWD",
    subtotalFils,
    discountFils,
    totalFils,
  }));
});

export default router;
