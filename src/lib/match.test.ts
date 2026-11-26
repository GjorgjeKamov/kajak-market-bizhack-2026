import { describe, it, expect } from "vitest";
import { scoreMatch } from "./market.server";
const prod = { location: "Strumica", free_delivery_areas: "Skopje", paid_delivery_macedonia: false, export_capability: null };
describe("scoreMatch", () => {
  it("rewards enough quantity, lower price and delivery area", () => {
    expect(scoreMatch({ quantity: 100, target_price: 50, delivery_location: "Skopje" }, { available_quantity: 200, price: 40, season: null }, prod)).toBe(100);
  });
  it("penalises insufficient quantity and high price", () => {
    expect(scoreMatch({ quantity: 500, target_price: 10 }, { available_quantity: 100, price: 40, season: null }, prod)).toBe(30);
  });
});

describe("price comparison respects currency", () => {
  const prod = { location: "Strumica", free_delivery_areas: null, paid_delivery_macedonia: null, export_capability: null };
  it("same currency: cheaper price scores higher", () => {
    expect(scoreMatch({ target_price: 50, currency: "денари" }, { available_quantity: null, price: 40, season: null, currency: "MKD" }, prod)).toBe(65);
  });
  it("different currencies are not compared", () => {
    expect(scoreMatch({ target_price: 50, currency: "MKD" }, { available_quantity: null, price: 1, season: null, currency: "EUR" }, prod)).toBe(50);
  });
});
