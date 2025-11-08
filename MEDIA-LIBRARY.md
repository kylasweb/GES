# Media Library Implementation

## Overview
A complete media management system for managing images, videos, and documents across the e-commerce platform.

## Features Implemented

### ✅ Database Schema
- **Media Model** with comprehensive metadata:
  - File information (filename, originalName, mimeType, size)
  - Image dimensions (width, height)
  - URLs (main file + thumbnail)
  - Metadata (alt text, caption, tags)
  - Organization (folder, type)
  - Tracking (uploadedBy, usageCount, timestamps)

### ✅ API Endpoints

#### Admin Media Management
- **GET** `/api/v1/admin/media` - List all media with filters
  - Filters: type, folder, search
  - Pagination support
  - Returns media with metadata

- **POST** `/api/v1/admin/media` - Upload media files
  - Automatic image processing (thumbnails, dimensions)
  - Folder organization
  - Alt text, caption, tags support
  - 10MB file size limit

- **GET** `/api/v1/admin/media/[id]` - Get single media file
- **PUT** `/api/v1/admin/media/[id]` - Update media metadata
- **DELETE** `/api/v1/admin/media/[id]` - Delete single media file
- **DELETE** `/api/v1/admin/media` (bulk) - Delete multiple files

### ✅ Admin UI (`/admin/media`)

#### Features:
1. **Upload Interface**
   - Drag & drop file selection
   - Multi-file upload support
   - Folder selection (general, products, banners, blog, categories)
   - Alt text, caption, tags input
   - Upload progress

2. **Browse & Filter**
   - Grid view (6 columns) and List view
   - Search by filename, alt text, caption
   - Filter by type (Image, Video, Document, Other)
   - Filter by folder
   - Real-time search

3. **Media Management**
   - Select single/multiple files
   - Bulk delete
   - Copy URL to clipboard
   - Edit metadata (alt, caption, folder, tags)
   - View file details (size, dimensions, upload date)

4. **Statistics Dashboard**
   - Total files count
   - Images count
   - Videos count
   - Documents count
   - Total storage size

#### View Modes:
- **Grid View**: Visual thumbnail grid with quick actions
- **List View**: Detailed table with all metadata

### ✅ Media Picker Component (`<MediaPicker>`)
Reusable component for selecting media in forms:
- Single or multiple selection
- Filter by media type
- Search and folder filters
- Preview thumbnails
- Select and confirm workflow

#### Usage Example:
```tsx
import { MediaPicker } from '@/components/media-picker';

function MyForm() {
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);

  return (
    <>
      <Button onClick={() => setIsPickerOpen(true)}>
        Select Images
      </Button>
      
      <MediaPicker
        isOpen={isPickerOpen}
        onClose={() => setIsPickerOpen(false)}
        onSelect={(urls) => setSelectedImages(urls)}
        multiple={true}
        type="IMAGE"
        selectedUrls={selectedImages}
      />
    </>
  );
}
```

### ✅ Image Processing (Sharp)
- Automatic thumbnail generation (300x300px)
- Dimension extraction
- Format support: JPEG, PNG, WebP, SVG, etc.

### ✅ File Organization
```
public/
  uploads/
    media/
      general/         - General purpose files
      products/        - Product images
      banners/         - Banner/hero images
      blog/            - Blog post images
      categories/      - Category images
      thumbnails/      - Auto-generated thumbnails
```

## Access Control
- **SUPER_ADMIN**: Full access (upload, edit, delete)
- **CONTENT_MANAGER**: Upload and edit access
- All media operations require authentication

## Technical Stack
- **Database**: PostgreSQL (Prisma ORM)
- **Image Processing**: Sharp.js
- **Storage**: Local filesystem (Vercel-compatible)
- **UI**: React + shadcn/ui + Tailwind CSS

## File Support
- **Images**: JPEG, PNG, GIF, WebP, SVG
- **Videos**: MP4, WebM, etc.
- **Documents**: PDF, DOC, DOCX, etc.
- **Size Limit**: 10MB per file

## Future Enhancements
- [ ] Cloud storage integration (AWS S3, Cloudinary)
- [ ] Image cropping/editing tools
- [ ] Image optimization on upload
- [ ] CDN integration
- [ ] Usage tracking (which products use which media)
- [ ] Media usage reports
- [ ] Unused media cleanup
- [ ] Batch image optimization
- [ ] Video thumbnail generation
- [ ] Drag & drop upload area

## Integration Points

### Products
Can now use MediaPicker component in product forms for:
- Product images
- Product galleries
- Category images
- Brand logos

### Content Management
Use MediaPicker for:
- Hero banners
- Content blocks
- Blog post images

### Admin Settings
Use for:
- Site logo
- Favicon
- Social media images

## API Response Examples

### Upload Response:
```json
{
  "success": true,
  "data": {
    "id": "clx...",
    "filename": "1699564123_abc123.jpg",
    "originalName": "product-image.jpg",
    "mimeType": "image/jpeg",
    "size": 245678,
    "width": 1920,
    "height": 1080,
    "url": "/uploads/media/products/1699564123_abc123.jpg",
    "thumbnailUrl": "/uploads/media/thumbnails/thumb_1699564123_abc123.jpg",
    "alt": "Solar panel 300W",
    "caption": "High efficiency solar panel",
    "type": "IMAGE",
    "folder": "products",
    "tags": ["solar", "product"],
    "uploadedBy": "admin@example.com",
    "usageCount": 0,
    "createdAt": "2024-11-08T00:00:00.000Z",
    "updatedAt": "2024-11-08T00:00:00.000Z"
  }
}
```

### List Response:
```json
{
  "success": true,
  "data": {
    "media": [...],
    "pagination": {
      "page": 1,
      "limit": 50,
      "total": 156,
      "totalPages": 4
    }
  }
}
```

## Migration Applied
- `20251108001643_add_media_library`
- Added `Media` model with MediaType enum

## Menu Location
Admin Sidebar → **Media** (ImageIcon)
