const express = require('express');
const { uploadCloud } = require('../config/cloudinary');
const path = require('path');
const Equipment = require('../models/Equipment');
const ImageEquipment = require('../models/ImageEquipment');
const auth = require('../middleware/auth');
const router = express.Router();
const Category = require('../models/Category');

// Get all equipments + images
router.get('/', async (req, res) => {
  try {
    const equipments = await Equipment.find().populate('Cat_id').populate('Promotion_id');
    const result = await Promise.all(equipments.map(async (eq) => {
      const images = await ImageEquipment.find({ equipment_id: eq._id });
      return { ...eq.toObject(), images: images.map(img => img.ImageEquipment_name) };
    }));
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get by ID
router.get('/:id', async (req, res) => {
  try {
    const equipment = await Equipment.findById(req.params.id).populate('Cat_id').populate('Promotion_id');
    const images = await ImageEquipment.find({ equipment_id: req.params.id });
    res.json({ ...equipment.toObject(), images: images.map(img => img.ImageEquipment_name) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add (admin)
router.post('/', auth, uploadCloud.array('images', 10), async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Access denied' });
  try {
    const { Promotion_id, Cat_id, ...rest } = req.body;
    const cleanedData = {
      ...rest,
      Promotion_id: Promotion_id === "" ? null : Promotion_id,
      Cat_id: Cat_id === "" ? null : Cat_id
    };
    const equipment = new Equipment(cleanedData);
    await equipment.save();
    if (req.files) {
      const images = req.files.map(file => ({
        equipment_id: equipment._id,
        ImageEquipment_name: file.path,
        ImageEquipment_extension: path.extname(file.originalname)
      }));
      await ImageEquipment.insertMany(images);
    }
    res.json(equipment);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Update (admin)
router.put('/:id', auth, uploadCloud.array('images', 10), async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Access denied' });
  try {
    const { Promotion_id, Cat_id, ...rest } = req.body;
    const cleanedData = {
      ...rest,
      Promotion_id: Promotion_id === "" ? null : Promotion_id,
      Cat_id: Cat_id === "" ? null : Cat_id
    };
    await Equipment.findByIdAndUpdate(req.params.id, cleanedData);

    if (req.body.deletedImages) {
      let toDelete = Array.isArray(req.body.deletedImages) ? req.body.deletedImages : [req.body.deletedImages];
      await ImageEquipment.deleteMany({ equipment_id: req.params.id, ImageEquipment_name: { $in: toDelete } });
    }

    if (req.files?.length > 0) {
      const images = req.files.map(file => ({
        equipment_id: req.params.id,
        ImageEquipment_name: file.path,
        ImageEquipment_extension: path.extname(file.originalname)
      }));
      await ImageEquipment.insertMany(images);
    }
    res.json({ message: 'อัปเดตสำเร็จ' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete (admin)
router.delete('/:id', auth, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Access denied' });
  try {
    await Equipment.findByIdAndDelete(req.params.id);
    await ImageEquipment.deleteMany({ equipment_id: req.params.id });
    res.json({ message: 'ลบสำเร็จ' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;