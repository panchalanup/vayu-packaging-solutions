# 3D Box Designer - Enhancement Requirements

## 📋 Document Overview

**Project:** Vayu Packaging Solutions - 3D Box Designer Enhancement  
**Version:** 2.0  
**Created:** March 13, 2026  
**Last Updated:** March 13, 2026  
**Status:** Planning & Implementation Phase

---

## 🎯 Project Vision

Transform our 3D Box Designer into a professional B2B tool specifically for corrugated packaging manufacturers, focusing on realistic visualization, professional dieline generation, and seamless quote integration.

### **Mission Statement**
Empower manufacturers, importers, and exporters with an intuitive tool to design, visualize, and order custom corrugated packaging with industrial accuracy and professional output.

---

## 👥 Target Audience

### **Primary Users:**

1. **Packaging Manufacturers**
   - Need: Repeat orders, consistent specifications
   - Pain Point: Manual design processes, specification errors
   - Goal: Quick reordering, design storage, accurate quotes

2. **Import/Export Businesses**
   - Need: Custom packaging for various products
   - Pain Point: Communication gaps with manufacturers
   - Goal: Visual specifications, easy modifications, cost clarity

3. **Sales Teams**
   - Need: Quick mockups for clients
   - Pain Point: Dependency on design teams
   - Goal: Real-time design, instant quotes, professional output

### **User Flow:**
```
Design → Visualize → Customize → Get Quote → Save Design → Reorder
```

---

## 🌟 Core Value Proposition

**What Makes Us Different from Pacdora:**

| Feature | Pacdora | Our Tool |
|---------|---------|----------|
| Focus | General mockups (bags, bottles, apparel) | **Corrugated boxes only** |
| Audience | Designers, marketers | **B2B manufacturers** |
| Output | Pretty mockups | **Manufacturing-ready dielines** |
| Integration | Standalone | **Integrated with quote system** |
| Specs | Generic | **Industry FEFCO standards** |
| Pricing | N/A | **Real-time cost estimation** |

---

## ✨ 5 PERFECT FEATURES (Priority Focus)

### **1. 🎨 Realistic Corrugated Material Rendering**

**Objective:** Industry-accurate material visualization

**Features:**
- Realistic kraft paper textures (brown & white board)
- Corrugated flute patterns (A, B, C, E flutes)
- Material thickness visualization
- Realistic lighting and shadows
- Surface finish options (matte, glossy)

**Technical Specs:**
- Use texture mapping in Three.js
- Normal maps for corrugated patterns
- PBR (Physically Based Rendering) materials
- Texture resolution: 2048x2048px minimum

**Acceptance Criteria:**
- ✅ Box looks like actual corrugated material
- ✅ Different ply types show visible thickness differences
- ✅ Flute patterns are visible and accurate
- ✅ Brown kraft vs white board clearly distinguishable

---

### **2. 📄 Professional Dieline Generation**

**Objective:** Export manufacturing-ready dieline templates

**Features:**
- FEFCO-standard dieline templates
- Cutting lines (solid) and folding lines (dashed)
- Glue tabs and flaps
- Dimension annotations
- Safety margins for printing
- Export formats: PDF, SVG, DXF

**Technical Specs:**
- Programmatic SVG generation
- Industry-standard line types:
  - Cutting lines: Solid black (0.5pt)
  - Folding lines: Dashed red (0.25pt)
  - Glue flaps: Dotted green
- Include dimension text annotations
- A4/A3 page size options

**FEFCO Codes to Support (Phase 1):**
- FEFCO 0201 - RSC (Regular Slotted Container)
- FEFCO 0203 - HSC (Half Slotted Container)
- FEFCO 0427 - Mailer Box
- FEFCO 0453 - Die-Cut Box

**Acceptance Criteria:**
- ✅ Dieline can be sent directly to die-cutting machine
- ✅ Dimensions are accurate to 0.1mm
- ✅ Print areas clearly marked
- ✅ PDF includes specification sheet on separate page

---

### **3. 🎨 Simple Graphic Customization**

**Objective:** Easy branding and design application

**Features:**
- **Logo/Image Upload**
  - Drag-and-drop file upload
  - Supported formats: PNG, JPG, SVG
  - Max file size: 10MB
  - Image preview before upload

- **Text Addition**
  - Click-to-add text on any face
  - Font selection (10 professional fonts)
  - Size adjustment (10-200pt)
  - Color picker (HEX/RGB)
  - Alignment options (left, center, right)

- **Positioning System**
  - Drag to move
  - Handles to resize
  - Rotate with angle input
  - Snap-to-grid option
  - Print-safe zone indicators

**Technical Specs:**
- Canvas API for 2D manipulation
- Three.js texture mapping for 3D preview
- Store positions as normalized coordinates (0-1)
- Convert to actual mm for dieline export

**Acceptance Criteria:**
- ✅ Upload and position logo in <30 seconds
- ✅ Text is clear and readable in 3D view
- ✅ Graphics export correctly on dieline
- ✅ Print-safe zones prevent edge bleeding

---

### **4. 💰 Instant Cost Estimation**

**Objective:** Real-time pricing for informed decisions

**Features:**
- Live cost calculation as dimensions change
- Material cost breakdown:
  - Raw material (ply type, size)
  - Printing cost (color count, area)
  - Die-cutting cost (complexity)
  - Minimum order quantity (MOQ)
- Price per unit at different quantities
- Total order estimate
- Direct link to full quote tool

**Pricing Formula:**
```javascript
Base Material Cost = (Length × Width × 2 + Width × Height × 4 + Length × Height × 2) × Ply Rate

Printing Cost = Print Area × Color Count × Print Rate

Die-Cutting = Complexity Score × Base Rate

Unit Price = (Base + Printing + Die-Cutting) × Margin

MOQ Tiers:
- 100-500 units: +20%
- 500-1000 units: +10%
- 1000-5000 units: Base price
- 5000+ units: -10%
```

**Acceptance Criteria:**
- ✅ Price updates in <500ms when dimensions change
- ✅ Breakdown shows clear cost components
- ✅ MOQ recommendations are reasonable
- ✅ "Get Detailed Quote" button navigates to quote tool with specs

---

### **5. 📦 Industry-Standard FEFCO Templates**

**Objective:** Professional box styles with accurate specifications

**Features:**
- 10 FEFCO-standard templates (starting with 4)
- Template preview with 2D diagram
- Automatic dimension constraints per style
- Construction method visualization
- Material usage calculator

**Initial Templates:**
1. **FEFCO 0201 (RSC)** - Regular Slotted Container
   - Most common, 4 flaps meet at center
   - Use: General purpose packaging

2. **FEFCO 0203 (HSC)** - Half Slotted Container  
   - One open end (top or bottom)
   - Use: Display boxes, easy access

3. **FEFCO 0427** - Mailer Box
   - Self-locking, no tape needed
   - Use: E-commerce, retail

4. **FEFCO 0453** - Die-Cut with Lid
   - Custom shape with separate lid
   - Use: Premium products, gift boxes

**Future Templates:**
- FEFCO 0421 - Wrap-around box
- FEFCO 0711 - Display box with window
- FEFCO 0426 - Shelf-ready packaging (SRP)
- FEFCO 0300 - Telescope boxes
- FEFCO 0215 - Full overlap containers
- FEFCO 0452 - Crash-lock bottom boxes

**Technical Specs:**
- Each template has:
  - 3D model geometry function
  - Dieline generation function
  - Dimension constraints
  - Material multiplier
  - Assembly instructions

**Acceptance Criteria:**
- ✅ Template switches update 3D view instantly
- ✅ Constraints prevent invalid dimensions
- ✅ Each template has unique, accurate geometry
- ✅ Material usage calculated correctly per style

---

## 🔧 Technical Architecture

### **Current Stack:**
- **Frontend:** React + TypeScript
- **3D Rendering:** Three.js + React Three Fiber
- **UI Components:** shadcn/ui
- **Styling:** Tailwind CSS
- **State Management:** React useState
- **Routing:** React Router

### **New Dependencies Needed:**

```json
{
  "dependencies": {
    "jspdf": "^2.5.1",              // PDF generation
    "svg-pathdata": "^6.0.3",        // SVG path manipulation
    "maath": "^0.10.7",              // Advanced 3D math
    "three-mesh-bvh": "^0.6.5",      // Better raycasting
    "file-saver": "^2.0.5",          // File downloads
    "react-dropzone": "^14.2.3",     // File upload
    "color": "^4.2.3",               // Color manipulation
    "canvas-confetti": "^1.9.2"      // Success animations
  }
}
```

### **File Structure:**

```
src/
├── lib/
│   ├── boxDesigner/
│   │   ├── constants.ts                  (existing)
│   │   ├── textureLoader.ts              (new)
│   │   ├── dielineGenerator.ts           (new)
│   │   ├── costCalculator.ts             (new)
│   │   ├── fefcoTemplates.ts             (new)
│   │   └── localStorage.ts               (new)
├── components/
│   ├── BoxDesigner/
│   │   ├── Canvas3D.tsx                  (existing)
│   │   ├── Box3DModel.tsx                (existing - enhance)
│   │   ├── TemplateSelector.tsx          (existing - enhance)
│   │   ├── DimensionInputs.tsx           (existing)
│   │   ├── PlySelector.tsx               (existing - enhance)
│   │   ├── MaterialPreview.tsx           (new)
│   │   ├── GraphicsUploader.tsx          (new)
│   │   ├── TextEditor.tsx                (new)
│   │   ├── CostEstimator.tsx             (new)
│   │   ├── DielineExporter.tsx           (new)
│   │   └── SavedDesigns.tsx              (new)
├── types/
│   └── boxDesigner.ts                    (existing - extend)
└── pages/
    └── BoxDesigner.tsx                   (existing - enhance)
```

---

## 📅 Implementation Roadmap

### **PHASE 1: Enhanced Visuals** (3-4 days)

**Goal:** Make boxes look like real corrugated material

**Tasks:**

1. **Texture System** (Day 1)
   - [ ] Create/source kraft paper textures
   - [ ] Create corrugated flute normal maps
   - [ ] Implement texture loader utility
   - [ ] Add texture caching

2. **Material Enhancement** (Day 2)
   - [ ] Upgrade Box3DModel to use PBR materials
   - [ ] Add normal maps for flutes
   - [ ] Implement ply-specific thickness
   - [ ] Add edge highlighting

3. **Lighting Improvements** (Day 3)
   - [ ] Add environment map
   - [ ] Enhance directional lighting
   - [ ] Add subtle ambient occlusion
   - [ ] Optimize shadow quality

4. **Material Preview Panel** (Day 4)
   - [ ] Create MaterialPreview component
   - [ ] Show material swatch
   - [ ] Display specifications
   - [ ] Add material comparison view

**Deliverables:**
- ✅ Photorealistic corrugated box rendering
- ✅ Visible flute patterns
- ✅ Accurate material colors
- ✅ Professional lighting

---

### **PHASE 2: Graphics & Customization** (4-5 days)

**Goal:** Enable simple branding and customization

**Tasks:**

1. **Image Upload System** (Day 1-2)
   - [ ] Create GraphicsUploader component
   - [ ] Implement drag-and-drop with react-dropzone
   - [ ] Image validation and compression
   - [ ] Preview before application
   - [ ] Store images in localStorage (base64 or IndexedDB)

2. **Face Graphics Management** (Day 2-3)
   - [ ] Add graphics to faceImages state
   - [ ] Implement texture mapping for uploaded images
   - [ ] Create positioning handles in 3D
   - [ ] Add resize and rotate controls
   - [ ] Snap-to-grid functionality

3. **Text Editor Tool** (Day 3-4)
   - [ ] Create TextEditor component
   - [ ] Font selector (10 web-safe fonts)
   - [ ] Color picker integration
   - [ ] Size and alignment controls
   - [ ] Canvas-based text rendering
   - [ ] Convert text to texture for 3D

4. **Graphics Panel UI** (Day 4-5)
   - [ ] Face selector (which face to edit)
   - [ ] Layer management (text above images)
   - [ ] Delete/clear graphics
   - [ ] Print-safe zone indicators
   - [ ] Export graphics with dieline

**Deliverables:**
- ✅ Upload and position logos
- ✅ Add text to any face
- ✅ Intuitive editing controls
- ✅ Graphics persist in saved designs

---

### **PHASE 3: Dieline Generation** (5-6 days) - Future

**Tasks:**
- [ ] SVG path generation for each FEFCO template
- [ ] Dimension annotation system
- [ ] PDF export with jsPDF
- [ ] Multi-page PDF (dieline + specs)
- [ ] DXF export for CAD software

---

### **PHASE 4: Cost Calculator** (3-4 days) - Future

**Tasks:**
- [ ] Pricing formula implementation
- [ ] Material cost database
- [ ] MOQ tier system
- [ ] Real-time calculation
- [ ] Cost breakdown UI
- [ ] Integration with quote tool

---

### **PHASE 5: Save/Load System** (2-3 days) - Future

**Tasks:**
- [ ] localStorage schema
- [ ] Save design function
- [ ] Load design function
- [ ] Design library UI
- [ ] Delete/rename designs
- [ ] Export/import design files

---

## 💾 Data Storage Strategy

### **localStorage Schema:**

```javascript
// Key: 'vayu_box_designs'
{
  "designs": [
    {
      "id": "uuid-v4",
      "name": "Product Box - Large",
      "template": "rsc",
      "dimensions": {
        "length": 30,
        "width": 20,
        "height": 15
      },
      "ply": "5-ply",
      "faceImages": [
        {
          "face": "front",
          "imageData": "base64...",  // or IndexedDB reference
          "position": { "x": 0.5, "y": 0.5 },
          "scale": 0.8,
          "rotation": 0
        }
      ],
      "textElements": [
        {
          "face": "top",
          "text": "HANDLE WITH CARE",
          "font": "Arial",
          "size": 24,
          "color": "#000000",
          "position": { "x": 0.5, "y": 0.2 }
        }
      ],
      "createdAt": "2026-03-13T10:00:00Z",
      "updatedAt": "2026-03-13T10:30:00Z"
    }
  ]
}
```

### **Storage Limits:**
- localStorage: ~5MB (use for metadata)
- IndexedDB: ~50MB+ (use for images)
- Strategy: Store thumbnails in localStorage, full images in IndexedDB

---

## 🎨 Design System

### **Material Colors:**

```javascript
const MATERIAL_COLORS = {
  kraft: {
    brown: '#D4A574',
    darkBrown: '#B88A47',
    lightBrown: '#E8C9A0',
    white: '#F5F5F0',
  },
  flutes: {
    A: { height: 4.8, spacing: 8.0 },   // 33 flutes/ft
    B: { height: 2.4, spacing: 6.4 },   // 47 flutes/ft
    C: { height: 3.6, spacing: 8.0 },   // 39 flutes/ft
    E: { height: 1.2, spacing: 3.2 },   // 90 flutes/ft
  },
  ply: {
    '3-ply': { thickness: 2.5, color: '#D4A574' },
    '5-ply': { thickness: 4.0, color: '#C89B5C' },
    '7-ply': { thickness: 6.0, color: '#B88A47' },
  }
};
```

### **Typography:**

```javascript
const FONTS = {
  branding: [
    'Arial', 'Helvetica', 'Roboto',
    'Open Sans', 'Montserrat'
  ],
  industrial: [
    'Courier New', 'Monaco', 'Consolas',
    'Impact', 'Franklin Gothic'
  ]
};
```

---

## 🧪 Testing Requirements

### **Phase 1 Testing:**
- [ ] Textures load correctly
- [ ] Materials render on all devices
- [ ] Performance: 60fps on mid-range hardware
- [ ] Mobile responsive (preview only)

### **Phase 2 Testing:**
- [ ] Upload images <10MB
- [ ] Graphics position accurately
- [ ] Text renders clearly
- [ ] All fonts display correctly
- [ ] localStorage doesn't exceed limits

### **Browser Support:**
- Chrome 90+ ✅
- Firefox 88+ ✅
- Safari 14+ ✅
- Edge 90+ ✅
- Mobile browsers (preview only)

---

## 📊 Success Metrics

### **User Engagement:**
- Average time on tool: >5 minutes
- Designs created per session: >1.5
- Return users: >30%

### **Business Impact:**
- Quote conversions: +25%
- Custom orders: +40%
- Customer satisfaction: >4.5/5

### **Technical Performance:**
- Page load: <3 seconds
- 3D render: <500ms
- Export dieline: <2 seconds

---

## 🚧 Known Limitations & Constraints

### **Current Limitations:**
1. **No backend** - All data stored locally
2. **No collaboration** - Single user only
3. **Limited templates** - Starting with 4, expand later
4. **No mobile editing** - Desktop only (mobile preview)
5. **Image size** - Max 10MB per image

### **Technical Constraints:**
1. **WebGL requirement** - Users need modern browser
2. **localStorage limits** - ~5MB total storage
3. **3D performance** - Requires decent GPU
4. **File exports** - Client-side only

---

## 🔮 Future Enhancements (Phase 6+)

### **Advanced Features:**
- [ ] Multi-user collaboration
- [ ] Design templates marketplace
- [ ] AR preview (phone camera)
- [ ] Batch ordering
- [ ] Design versioning
- [ ] Print color matching (Pantone)
- [ ] Structural strength calculator
- [ ] Eco-friendly material badges
- [ ] Integration with shipping calculators
- [ ] QR code generator for boxes

### **AI Features (Long-term):**
- [ ] Auto-suggest dimensions based on product
- [ ] AI-generated graphics
- [ ] Design optimization suggestions
- [ ] Cost optimization recommendations

---

## 📝 Documentation Needs

### **User Documentation:**
- [ ] Quick start guide
- [ ] Video tutorials
- [ ] FEFCO code explanations
- [ ] Material selection guide
- [ ] Troubleshooting FAQ

### **Technical Documentation:**
- [ ] API documentation (if backend added)
- [ ] Component documentation
- [ ] Dieline format specifications
- [ ] Testing guide

---

## 🤝 Stakeholder Sign-off

### **Approved By:**
- [ ] Product Owner
- [ ] Technical Lead
- [ ] Sales Team Representative
- [ ] Manufacturing Partner

### **Review Schedule:**
- Weekly progress reviews
- Phase completion demos
- Monthly stakeholder updates

---

## 📞 Support & Contact

**Project Lead:** Anup Panchal  
**Repository:** https://github.com/panchalanup/vayu-packaging-solutions  
**Documentation:** This file  
**Issue Tracking:** GitHub Issues

---

## 📄 Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0 | 2026-03-13 | Initial requirements document | Cline AI |
| 2.0 | TBD | Post Phase 1 updates | TBD |

---

## ✅ Quick Reference Checklist

### **Phase 1: Enhanced Visuals**
- [ ] Kraft paper textures
- [ ] Corrugated flute patterns
- [ ] PBR materials
- [ ] Improved lighting
- [ ] Material preview panel

### **Phase 2: Graphics & Customization**
- [ ] Image upload
- [ ] Logo positioning
- [ ] Text editor
- [ ] Color picker
- [ ] Face selector

### **5 Perfect Features Status**
- [ ] 1. Realistic corrugated material rendering
- [ ] 2. Professional dieline generation
- [ ] 3. Simple graphic customization
- [ ] 4. Instant cost estimation
- [ ] 5. Industry-standard FEFCO templates

---

**Last Updated:** March 13, 2026  
**Status:** Ready for Implementation ✅  
**Next Action:** Begin Phase 1 Development
