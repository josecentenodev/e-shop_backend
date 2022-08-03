const { Product } = require("../models/product");
const express = require("express");
const { Category } = require("../models/category");
const router = express.Router();
const mongoose = require("mongoose");
const multer = require("multer");

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const isValid = FILE_TYPE_MAP[file.mimetype];
        let uploadError = new Error("Invalid image type");
        if (isValid) {
            uploadError = null;
        }
        cb(uploadError, "public/uploads");
    },
    filename: function (req, file, cb) {
        // const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        // cb(null, file.fieldname + "-" + uniqueSuffix);
        const extension = FILE_TYPE_MAP[file.mimetype];
        const fileName = file.originalname.replace(" ", "-");
        cb(null, `${fileName}-${Date.now()}.${extension}`);
    },
});

const upload = multer({ storage: storage });

const FILE_TYPE_MAP = {
    "image/png": "png",
    "image/jpeg": "jpeg",
    "image/jpg": "jpg",
};

router.get(`/`, async (req, res) => {
    // localhost:3000/api/v1/products?categories=2342342,234234
    let filter = {};
    if (req.query.categories) {
        filter = { category: req.query.categories.split(",") };
    }

    const productList = await Product.find(filter).populate("category");

    if (!productList) {
        res.status(500).json({ success: false });
    }
    res.send(productList);
});

router.get(`/:id`, async (req, res) => {
    const product = await Product.findById(req.params.id).populate("category");

    if (!product) {
        res.status(500).json({ success: false });
    }
    res.send(product);
});

router.get(`/get/count`, async (req, res) => {
    Product.countDocuments()
        .then((data, err) => {
            if (!err) {
                res.send({ data: data });
            } else {
                res.status(500).json(err);
            }
        })
        .catch(function (err) {
            console.log(err);
        });
});

router.get(`/get/featured/:count`, async (req, res) => {
    const count = req.params.count ? req.params.count : 0;
    const products = await Product.find({ isFeatured: true }).limit(+count);

    if (!products) {
        res.status(500).json({ success: false });
    }
    res.send(products);
});

router.post(`/`, upload.single("image"), async (req, res) => {
    const category = await Category.findById(req.body.category);
    const file = req.file;
    if (!category) return res.status(400).send("Invalid Category");
    if (!file) return res.status(400).send("file is a must");
    const fileName = req.file.filename;
    const basePath = `${req.protocol}://${req.get("host")}/public/uploads/`;
    let product = new Product({
        name: req.body.name,
        description: req.body.description,
        richDescription: req.body.richDescription,
        image: `${basePath}${fileName}`,
        brand: req.body.brand,
        price: req.body.price,
        category: req.body.category,
        countInStock: req.body.countInStock,
        rating: req.body.rating,
        numReviews: req.body.numReviews,
        isFeatured: req.body.isFeatured,
    });
    product = await product.save();

    if (!product) {
        return res.status(500).send("The product cannot be created");
    }

    res.send(product);
});

router.put("/:id", upload.single("image"), async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
        return res.status(400).send("Invalid Product Id");
    }
    const category = await Category.findById(req.body.category);
    if (!category) return res.status(400).send("Invalid Category");

    const productFound = await Product.findById(req.params.id);
    if (!productFound) return res.status(400).send("Product not found");

    const file = req.file;
    let imagepath;
    if (file) {
        const fileName = req.file.filename;
        const basePath = `${req.protocol}://${req.get("host")}/public/uploads/`;
        imagepath = `${basePath}${fileName}`;
    } else {
        imagepath = productFound.image;
    }

    const product = await Product.findByIdAndUpdate(
        req.params.id,
        {
            name: req.body.name,
            description: req.body.description,
            richDescription: req.body.richDescription,
            image: imagepath,
            brand: req.body.brand,
            price: req.body.price,
            category: req.body.category,
            countInStock: req.body.countInStock,
            rating: req.body.rating,
            numReviews: req.body.numReviews,
            isFeatured: req.body.isFeatured,
        },
        { new: true }
    );

    if (!product) return res.status(500).send("the product cannot be updated!");

    res.send(product);
});

router.put(
    "/product-gallery/:id",
    upload.array("images", 5),
    async (req, res) => {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).send("Invalid Product Id");
        }
        const files = req.files;
        let imagesPaths = [];
        const basePath = `${req.protocol}://${req.get("host")}/public/uploads/`;
        if (files) {
            files.map((file) => {
                imagesPaths.push(`${basePath}${file.fileName}`);
            });
        }

        const product = await Product.findByIdAndUpdate(
            req.params.id,
            {
                images: imagesPaths,
            },
            { new: true }
        );
        if (!product)
            return res.status(500).send("the product cannot be updated!");

        res.send(product);
    }
);

router.delete("/:id", (req, res) => {
    Product.findByIdAndRemove(req.params.id)
        .then((product) => {
            if (product) {
                return res.status(200).json({
                    success: true,
                    message: "the product is deleted!",
                });
            } else {
                return res
                    .status(404)
                    .json({ success: false, message: "product not found!" });
            }
        })
        .catch((err) => {
            return res.status(500).json({ success: false, error: err });
        });
});

module.exports = router;
