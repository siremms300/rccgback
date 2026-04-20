import { Request, Response } from 'express';
import { Gallery } from '../models/Gallery';
import { AuthRequest } from '../middleware/auth';
import cloudinary from '../config/cloudinary';

export const getGalleryItems = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;
    const album = req.query.album as string;

    let query: any = { isActive: true };
    if (album) query.album = album;

    const galleries = await Gallery.find(query)
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit)
      .populate('createdBy', 'name')
      .populate('images.uploadedBy', 'name');

    const total = await Gallery.countDocuments(query);

    res.json({
      galleries,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getGalleryItem = async (req: Request, res: Response) => {
  try {
    const gallery = await Gallery.findById(req.params.id)
      .populate('createdBy', 'name')
      .populate('images.uploadedBy', 'name');

    if (!gallery) {
      return res.status(404).json({ message: 'Gallery item not found' });
    }

    res.json({ gallery });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const createGalleryItem = async (req: AuthRequest, res: Response) => {
  try {
    const gallery = await Gallery.create({
      ...req.body,
      createdBy: req.user?._id,
    });

    res.status(201).json({
      message: 'Gallery item created successfully',
      gallery,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateGalleryItem = async (req: AuthRequest, res: Response) => {
  try {
    const gallery = await Gallery.findById(req.params.id);
    
    if (!gallery) {
      return res.status(404).json({ message: 'Gallery item not found' });
    }

    if (gallery.createdBy.toString() !== req.user?._id.toString() && req.user?.role !== 'super_admin') {
      return res.status(403).json({ message: 'Not authorized to update this gallery item' });
    }

    const updatedGallery = await Gallery.findByIdAndUpdate(
      req.params.id,
      { ...req.body },
      { new: true, runValidators: true }
    );

    res.json({
      message: 'Gallery item updated successfully',
      gallery: updatedGallery,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteGalleryItem = async (req: AuthRequest, res: Response) => {
  try {
    const gallery = await Gallery.findById(req.params.id);
    
    if (!gallery) {
      return res.status(404).json({ message: 'Gallery item not found' });
    }

    if (gallery.createdBy.toString() !== req.user?._id.toString() && req.user?.role !== 'super_admin') {
      return res.status(403).json({ message: 'Not authorized to delete this gallery item' });
    }

    // Delete images from Cloudinary
    for (const image of gallery.images) {
      await cloudinary.uploader.destroy(image.publicId);
    }

    gallery.isActive = false;
    await gallery.save();

    res.json({ message: 'Gallery item deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getAlbums = async (req: Request, res: Response) => {
  try {
    const albums = await Gallery.distinct('album', { isActive: true });
    res.json({ albums });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};