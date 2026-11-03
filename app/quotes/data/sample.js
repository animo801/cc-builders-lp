// SAMPLE QUOTE: a realistic example so the template has something to show.
// Real quotes go in their own file next to this one.
const premiumItems = [
  { name: "Permits & Plans", price: 3850, description: "Architectural drawings, engineering review and city building permits" },
  { name: "Demolition & Haul-Off", price: 9400, description: "Removing existing kitchen, bathrooms and flooring, with dumpster and disposal fees" },
  { name: "Framing & Structural", price: 14750, description: "Opening the kitchen wall with a new beam, plus reframing both bathrooms" },
  { name: "Plumbing", price: 16900, description: "New supply and drain lines, kitchen sink relocation and premium fixtures" },
  { name: "Electrical", price: 15300, description: "Panel upgrade to 200A, recessed lighting, under-cabinet lights and new outlets" },
  { name: "HVAC", price: 12800, description: "High-efficiency furnace and AC with rerouted ductwork" },
  { name: "Drywall & Texture", price: 11200, description: "Hanging, taping and texturing all new and repaired walls and ceilings" },
  { name: "Kitchen Cabinets & Countertops", price: 31500, description: "Custom shaker cabinets with soft-close hardware and quartz countertops" },
  { name: "Tile", price: 13950, description: "Large-format porcelain in the bathrooms, walk-in shower and kitchen backsplash" },
  { name: "Flooring", price: 12600, description: "Engineered hardwood throughout the main floor" },
  { name: "Appliance Package", price: 9800, description: "Stainless steel range, range hood, refrigerator, dishwasher and microwave" },
  { name: "Interior Paint & Trim", price: 8750, description: "New baseboards and door casings, with paint in up to 6 colors" },
];

const standardItems = [
  { name: "Permits & Plans", price: 3850, description: "Architectural drawings, engineering review and city building permits" },
  { name: "Demolition & Haul-Off", price: 9400, description: "Removing existing kitchen, bathrooms and flooring, with dumpster and disposal fees" },
  { name: "Framing & Structural", price: 14750, description: "Opening the kitchen wall with a new beam, plus reframing both bathrooms" },
  { name: "Plumbing", price: 15200, description: "New supply and drain lines, kitchen sink relocation and builder-grade fixtures" },
  { name: "Electrical", price: 13900, description: "Panel upgrade to 200A, recessed lighting and new outlets" },
  { name: "HVAC", price: 12800, description: "High-efficiency furnace and AC with rerouted ductwork" },
  { name: "Drywall & Texture", price: 11200, description: "Hanging, taping and texturing all new and repaired walls and ceilings" },
  { name: "Kitchen Cabinets & Countertops", price: 22400, description: "Stock shaker cabinets with quartz countertops" },
  { name: "Tile", price: 8600, description: "Ceramic tile in the bathrooms, tub surround and kitchen backsplash" },
  { name: "Flooring", price: 9450, description: "Luxury vinyl plank throughout the main floor" },
  { name: "Appliance Package", price: 5600, description: "Stainless steel range, refrigerator, dishwasher and microwave" },
  { name: "Interior Paint & Trim", price: 6900, description: "New baseboards and door casings, with paint in up to 2 colors" },
];

const sum = (items) => items.reduce((total, item) => total + item.price, 0);

export default {
  slug: "sample",
  customer: "Daniel and Maria Whitfield",
  address: "1842 S Juniper Lane, Sandy, UT",
  projectType: "Remodel",
  photo: "/images/quotes/sample-house.jpg",
  // Optional: which part of the photo stays visible in the square crop (CSS object-position).
  photoPosition: "50% 75%",
  options: [
    {
      name: "Premium Quote",
      total: sum(premiumItems),
      timeline: "12 months",
      description:
        "Allows for more options with tile in the bathrooms and kitchen, better appliances, more paint colors and more",
      items: premiumItems,
    },
    {
      name: "Standard Quote",
      total: sum(standardItems),
      timeline: "10 months",
      description: "Builder-grade tile, appliances, and paint, with the same layout and scope as the premium quote",
      items: standardItems,
    },
  ],
};
