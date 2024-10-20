const Product = require('../models/productModel');
const mongoose = require('mongoose');

exports.filterProductsOfCategory = async (req, res) => {
    try {
        const categoryId = req.params.categoryId;
        let { brands, minPrice, maxPrice, rates } = req.body;

        minPrice = minPrice || 0;
        maxPrice = maxPrice || Infinity;

        let rateConditions = [];
        // if (rates) {
        //     const rateRanges = rates.split(',').map(range => {
        //         const [min, max] = range.split('-').map(parseFloat);
        //         return { min, max };
        //     });

        //     rateConditions = rateRanges.map(range => ({
        //         rate: { $gte: range.min, $lte: range.max }
        //     }));
        // }

        let filter = {
            price: { $gte: minPrice, $lte: maxPrice },
            category: categoryId
        };

        if (brands.length > 0) {
            brands = brands.map(brand =>new mongoose.Types.ObjectId(brand))
            filter.brand = { $in: brands };
        }

        if (rateConditions.length > 0) {
            filter.$or = rateConditions;
        }

        try {
            const products = await Product.find(filter).populate("brand category size")
                .populate({
                    path: "size",
                    select: "name",
                });
            return res.status(200).json({ status: true, message: "get products success!", data: products });
        } catch (err) {
            res.status(500).json({ message: 'Error fetching products', status: false});
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });

    }
}


exports.searchProducts = async (req, res) => {
    const { query } = req.query;
    let { brands, minPrice, maxPrice, rates } = req.body;


    try {

        minPrice = minPrice || 0;
        maxPrice = maxPrice || Infinity;

        let rateConditions = [];
        // if (rates) {
        //     const rateRanges = rates.split(',').map(range => {
        //         const [min, max] = range.split('-').map(parseFloat);
        //         return { min, max };
        //     });

        //     rateConditions = rateRanges.map(range => ({
        //         rate: { $gte: range.min, $lte: range.max }
        //     }));
        // }

        let filter = {
            price: { $gte: minPrice, $lte: maxPrice }
        };

        if (brands.length > 0) {
            brands = brands.map(brand =>new mongoose.Types.ObjectId(brand));
            filter.brand = { $in: brands };
        }

        if (rateConditions.length > 0) {
            filter.$or = rateConditions;
        }

        const products = await Product.find({
            $or: [
                { name: new RegExp(query, "i") },
                { description: new RegExp(query, "i") },
            ],
            ...filter
        })
            .populate("brand category size")
            .populate({
                path: "size",
                select: "name",
            });

        res.status(200).json({data: products, status: true, message: "get products successfully"});
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error searching products", error });
    }
}