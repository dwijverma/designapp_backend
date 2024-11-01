const axios = require("axios");
require("dotenv").config();
const fetchImages = async (keywords) => {
  const apiKey = process.env.PEXELS_API_KEY;
  const url = "https://api.pexels.com/v1/search";
  const query = keywords.join(" ");

  try {
    const response = await axios.get(url, {
      headers: {
        Authorization: apiKey,
      },
      params: {
        query,
        per_page: 10, // Number of images to fetch
      },
    });
    return response.data.photos.map((photo) => ({
      url: photo.src.medium,
      photographer: photo.photographer,
    }));
  } catch (error) {
    console.error("Error fetching images from Pexels API:", error);
    return [];
  }
};

module.exports = fetchImages;
