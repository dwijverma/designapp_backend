const express = require("express");
const passport = require("passport");
const cookieSession = require("cookie-session");
require("./config/passport-setup.js"); // Ensure this is loaded
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./db/connect.db.js");
const routes = require("./routes/routes.js");
const authRoutes = require("./routes/authRoutes.js");
const projectPlanningRoutes = require("./routes/projectPlanningRoutes.js");
const critiqueRoutes = require("./routes/critiqueRoutes.js");
const colorPaletteRoutes = require("./routes/color-paletteRoutes.js");

const app = express();
const port = process.env.PORT || 2000;

const corsOptions = {
  origin: "https://www.designershangout.com", // Replace with your frontend domain
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true, // Enable if using cookies or credentials
};
// const corsOptions = {
//   origin: "http://localhost:3000", // Replace with your frontend domain
//   methods: ["GET", "POST", "PUT", "DELETE"],
//   allowedHeaders: ["Content-Type", "Authorization"],
//   credentials: true, // Enable if using cookies or credentials
// };

app.use(cors(corsOptions));

app.options("*", cors(corsOptions)); // Handle preflight requests

app.use(express.json());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(
  cookieSession({
    name: "session",
    keys: ["key1", "key2"],
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.get("/hello", async (req, res) => {
  res.status(200).json({ msg: "hello world" });
});

app.use("/", routes);
app.use("/auth", authRoutes);
app.use("/critique", critiqueRoutes);
app.use("/planning", projectPlanningRoutes);
app.use("/color-palette", colorPaletteRoutes);

const staticUrls = [
  {
    loc: "https://designershangout.com/",
    lastmod: "2024-12-01",
    changefreq: "daily",
    priority: 1.0,
  },
  {
    loc: "https://designershangout.com/brainstorming",
    lastmod: "2024-12-01",
    changefreq: "monthly",
    priority: 0.9,
  },
  {
    loc: "https://designershangout.com/color-schemes",
    lastmod: "2024-12-01",
    changefreq: "weekly",
    priority: 0.8,
  },
  {
    loc: "https://designershangout.com/font-generator",
    lastmod: "2024-12-01",
    changefreq: "weekly",
    priority: 0.8,
  },
  {
    loc: "https://designershangout.com/design-critique",
    lastmod: "2024-12-01",
    changefreq: "weekly",
    priority: 0.9,
  },
];

// Define the `/sitemap.xml` route
app.get("/sitemap.xml", (req, res) => {
  // Generate the XML content
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${staticUrls
    .map(
      (url) => `
  <url>
    <loc>${url.loc}</loc>
    <lastmod>${url.lastmod}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`
    )
    .join("")}
</urlset>`;

  // Set the response content type to XML
  res.header("Content-Type", "application/xml");
  res.send(sitemap);
});

connectDB()
  .then(() => {
    app.listen(port, () => {
      console.log(`Server listening on port ${port}`);
    });
  })
  .catch((err) => {
    console.log("This is at connectDB.then(): ", err);
  });
