// SAMPLE QUOTE: the content from the Figma mockup, so the template has
// something to show. Real quotes go in their own file next to this one.
const surveyItem = {
  name: "Survey",
  price: 836,
  description: "Marking building locations, verifying building elevation and providing letter to city",
};

export default {
  slug: "sample",
  customer: "Luke and Jessica Parsons",
  address: "367 E Belmont Street, SLC, UT",
  projectType: "Remodel",
  photo: "/images/quotes/sample-house.jpg",
  // Optional: which part of the photo stays visible in the square crop (CSS object-position).
  photoPosition: "50% 75%",
  options: [
    {
      name: "Premium Quote",
      total: 154514.52,
      timeline: "12 months",
      description:
        "Allows for more options with tile in the bathrooms and kitchen, better appliances, more paint colors and more",
      items: Array.from({ length: 6 }, () => surveyItem),
    },
    {
      name: "Standard Quote",
      total: 128930.0,
      timeline: "10 months",
      description: "Builder-grade tile, appliances, and paint, with the same layout and scope as the premium quote",
      items: Array.from({ length: 6 }, () => surveyItem),
    },
  ],
};
