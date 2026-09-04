# Technician Profile API Endpoints

## Technician Profile

### POST /api/technicians
Purpose: Create a technician profile.

Path parameters: None
Query parameters: None

Request body example:
```json
{
  "technicianId": "tech-001",
  "profilePhotoUrl": "https://example.com/profile.jpg",
  "businessName": "RapidFix Tech",
  "bio": "Certified electronics repair specialist for mobile and laptop devices.",
  "serviceArea": "Colombo",
  "yearsExperience": 7,
  "qualifications": ["CompTIA A+", "Mobile Repair Certificate"],
  "trust": {
    "averageRating": 4.8,
    "totalReviews": 32,
    "completedJobsCount": 120,
    "responseRate": 92
  },
  "impact": {
    "impactPoints": 350,
    "sustainabilityLevel": "Silver"
  }
}
```

Success response example:
```json
{
  "success": true,
  "message": "Technician profile created successfully",
  "data": {
    "technicianId": "tech-001",
    "businessName": "RapidFix Tech",
    "serviceArea": "Colombo",
    "yearsExperience": 7
  }
}
```

Important validation/error responses:
- 400: Business name cannot be empty
- 400: Years of experience cannot be negative
- 409: Technician profile already exists

### GET /api/technicians/{technicianId}
Purpose: Retrieve a technician profile by ID.

Path parameters:
- technicianId: Required technician identifier

Query parameters: None

Success response example:
```json
{
  "success": true,
  "message": "Technician profile retrieved successfully",
  "data": {
    "technicianId": "tech-001",
    "businessName": "RapidFix Tech",
    "bio": "Certified electronics repair specialist for mobile and laptop devices.",
    "serviceArea": "Colombo",
    "yearsExperience": 7,
    "qualifications": ["CompTIA A+", "Mobile Repair Certificate"]
  }
}
```

Important validation/error responses:
- 404: Technician not found

### PUT /api/technicians/{technicianId}
Purpose: Update basic technician profile data.

Path parameters:
- technicianId: Required technician identifier

Request body example:
```json
{
  "businessName": "RapidFix Tech Solutions",
  "serviceArea": "Colombo 07",
  "yearsExperience": 8
}
```

Success response example:
```json
{
  "success": true,
  "message": "Technician profile updated successfully",
  "data": {
    "technicianId": "tech-001",
    "businessName": "RapidFix Tech Solutions",
    "serviceArea": "Colombo 07",
    "yearsExperience": 8
  }
}
```

Important validation/error responses:
- 400: At least one field must be provided for update
- 400: Business name cannot be empty
- 404: Technician not found

## Skills

### GET /api/technicians/{technicianId}/skills
Purpose: Get all technician skills.

Path parameters:
- technicianId: Required technician identifier

Success response example:
```json
{
  "success": true,
  "message": "Technician skills retrieved successfully",
  "data": [
    { "id": "skill-123", "name": "Screen Replacement" },
    { "id": "skill-124", "name": "Battery Replacement" }
  ]
}
```

### POST /api/technicians/{technicianId}/skills
Purpose: Add a skill for a technician.

Request body example:
```json
{
  "name": "Charging Port Repair"
}
```

Success response example:
```json
{
  "success": true,
  "message": "Technician skill added successfully",
  "data": {
    "id": "skill-125",
    "name": "Charging Port Repair"
  }
}
```

Important validation/error responses:
- 400: Skill value cannot be empty
- 404: Technician not found

### DELETE /api/technicians/{technicianId}/skills/{skillId}
Purpose: Remove a technician skill.

Path parameters:
- technicianId: Required technician identifier
- skillId: Required skill identifier

Success response example:
```json
{
  "success": true,
  "message": "Technician skill removed successfully",
  "data": {
    "technicianId": "tech-001",
    "skills": []
  }
}
```

## Device Categories

### GET /api/technicians/{technicianId}/categories
Purpose: Get supported device categories.

Path parameters:
- technicianId: Required technician identifier

Success response example:
```json
{
  "success": true,
  "message": "Technician device categories retrieved successfully",
  "data": [
    { "id": "cat-1", "name": "Laptop Repair" },
    { "id": "cat-2", "name": "Mobile Repair" }
  ]
}
```

### POST /api/technicians/{technicianId}/categories
Purpose: Add a supported device category.

Request body example:
```json
{
  "name": "Tablet Repair"
}
```

Success response example:
```json
{
  "success": true,
  "message": "Technician device category added successfully",
  "data": {
    "id": "cat-3",
    "name": "Tablet Repair"
  }
}
```

Important validation/error responses:
- 400: Category value cannot be empty
- 404: Technician not found

### DELETE /api/technicians/{technicianId}/categories/{categoryId}
Purpose: Remove a supported device category.

Path parameters:
- technicianId: Required technician identifier
- categoryId: Required category identifier

Success response example:
```json
{
  "success": true,
  "message": "Technician device category removed successfully",
  "data": {
    "technicianId": "tech-001",
    "supportedDeviceCategories": []
  }
}
```

## Services

### GET /api/technicians/{technicianId}/services
Purpose: Get all services offered by a technician.

Path parameters:
- technicianId: Required technician identifier

Success response example:
```json
{
  "success": true,
  "message": "Technician services retrieved successfully",
  "data": [
    {
      "id": "service-1",
      "name": "Screen Replacement",
      "description": "Front glass and OLED repair for smartphones.",
      "minPrice": 15000,
      "maxPrice": 35000
    }
  ]
}
```

### POST /api/technicians/{technicianId}/services
Purpose: Add a service offered by a technician.

Request body example:
```json
{
  "name": "Laptop Diagnostic",
  "description": "System check, hardware test, and fault identification.",
  "minPrice": 2000,
  "maxPrice": 6000
}
```

Success response example:
```json
{
  "success": true,
  "message": "Technician service added successfully",
  "data": {
    "id": "service-2",
    "name": "Laptop Diagnostic",
    "description": "System check, hardware test, and fault identification.",
    "minPrice": 2000,
    "maxPrice": 6000
  }
}
```

Important validation/error responses:
- 400: Service name cannot be empty
- 400: Prices cannot be negative
- 400: Minimum price cannot exceed maximum price
- 404: Technician not found

### PUT /api/technicians/{technicianId}/services/{serviceId}
Purpose: Update an existing service.

Path parameters:
- technicianId: Required technician identifier
- serviceId: Required service identifier

Request body example:
```json
{
  "maxPrice": 7000,
  "description": "System check, hardware test, battery health check, and fault identification."
}
```

Success response example:
```json
{
  "success": true,
  "message": "Technician service updated successfully",
  "data": {
    "id": "service-2",
    "name": "Laptop Diagnostic",
    "description": "System check, hardware test, battery health check, and fault identification.",
    "minPrice": 2000,
    "maxPrice": 7000
  }
}
```

### DELETE /api/technicians/{technicianId}/services/{serviceId}
Purpose: Delete a technician service.

Path parameters:
- technicianId: Required technician identifier
- serviceId: Required service identifier

Success response example:
```json
{
  "success": true,
  "message": "Technician service removed successfully",
  "data": {
    "technicianId": "tech-001",
    "services": []
  }
}
```

## Availability

### GET /api/technicians/{technicianId}/availability
Purpose: Get technician availability schedule.

Path parameters:
- technicianId: Required technician identifier

Success response example:
```json
{
  "success": true,
  "message": "Technician availability retrieved successfully",
  "data": [
    {
      "id": "avail-1",
      "day": "Monday",
      "startTime": "09:00",
      "endTime": "17:00",
      "status": "available"
    }
  ]
}
```

### PUT /api/technicians/{technicianId}/availability
Purpose: Create or update the technician's working availability.

Request body example:
```json
{
  "day": "Tuesday",
  "startTime": "10:00",
  "endTime": "18:00",
  "status": "available"
}
```

Success response example:
```json
{
  "success": true,
  "message": "Technician availability updated successfully",
  "data": {
    "id": "avail-2",
    "day": "Tuesday",
    "startTime": "10:00",
    "endTime": "18:00",
    "status": "available"
  }
}
```

Important validation/error responses:
- 400: Working day must be valid
- 400: Start time must be in HH:MM format
- 400: End time must be after start time
- 404: Technician not found

## Portfolio

### GET /api/technicians/{technicianId}/portfolio
Purpose: Get all completed repair portfolio items.

Path parameters:
- technicianId: Required technician identifier

Success response example:
```json
{
  "success": true,
  "message": "Technician portfolio retrieved successfully",
  "data": [
    {
      "id": "portfolio-1",
      "imageUrl": "https://example.com/iphone-repair.jpg",
      "deviceCategory": "Mobile Repair",
      "title": "iPhone Battery Replacement",
      "shortDescription": "Battery replacement completed in 45 minutes.",
      "completionDate": "2026-08-10"
    }
  ]
}
```

### POST /api/technicians/{technicianId}/portfolio
Purpose: Add a completed repair item to the portfolio.

Request body example:
```json
{
  "imageUrl": "https://example.com/laptop-repair.jpg",
  "deviceCategory": "Laptop Repair",
  "title": "Dell Latitude Screen Repair",
  "shortDescription": "Display replacement for customer laptop.",
  "completionDate": "2026-08-15"
}
```

Success response example:
```json
{
  "success": true,
  "message": "Portfolio item added successfully",
  "data": {
    "id": "portfolio-2",
    "imageUrl": "https://example.com/laptop-repair.jpg",
    "deviceCategory": "Laptop Repair",
    "title": "Dell Latitude Screen Repair",
    "shortDescription": "Display replacement for customer laptop.",
    "completionDate": "2026-08-15"
  }
}
```

Important validation/error responses:
- 400: Portfolio title cannot be empty
- 400: Portfolio device/category cannot be empty
- 404: Technician not found

### PUT /api/technicians/{technicianId}/portfolio/{portfolioId}
Purpose: Update a portfolio item.

Path parameters:
- technicianId: Required technician identifier
- portfolioId: Required portfolio item identifier

Request body example:
```json
{
  "title": "Dell Latitude Screen Repair - Updated"
}
```

Success response example:
```json
{
  "success": true,
  "message": "Portfolio item updated successfully",
  "data": {
    "id": "portfolio-2",
    "title": "Dell Latitude Screen Repair - Updated"
  }
}
```

### DELETE /api/technicians/{technicianId}/portfolio/{portfolioId}
Purpose: Delete a portfolio item.

Path parameters:
- technicianId: Required technician identifier
- portfolioId: Required portfolio item identifier

Success response example:
```json
{
  "success": true,
  "message": "Portfolio item removed successfully",
  "data": {
    "technicianId": "tech-001",
    "portfolio": []
  }
}
```

## Public Profile

### GET /api/technicians/{technicianId}/public-profile
Purpose: Return the complete public-facing technician profile for consumers.

Path parameters:
- technicianId: Required technician identifier

Success response example:
```json
{
  "success": true,
  "message": "Public technician profile retrieved successfully",
  "data": {
    "technicianId": "tech-001",
    "businessName": "RapidFix Tech",
    "bio": "Certified electronics repair specialist for mobile and laptop devices.",
    "serviceArea": "Colombo",
    "yearsExperience": 7,
    "qualifications": ["CompTIA A+", "Mobile Repair Certificate"],
    "skills": ["Screen Replacement", "Battery Replacement"],
    "supportedDeviceCategories": ["Laptop Repair", "Mobile Repair"],
    "services": [
      {
        "id": "service-1",
        "name": "Screen Replacement",
        "description": "Front glass and OLED repair for smartphones.",
        "minPrice": 15000,
        "maxPrice": 35000
      }
    ],
    "availability": [
      {
        "id": "avail-1",
        "day": "Monday",
        "startTime": "09:00",
        "endTime": "17:00",
        "status": "available"
      }
    ],
    "portfolio": [],
    "averageRating": 4.8,
    "totalReviews": 32,
    "completedJobsCount": 120,
    "responseRate": 92,
    "impactPoints": 350,
    "sustainabilityLevel": "Silver"
  }
}
```

Important validation/error responses:
- 404: Technician not found

## Technician Search

### GET /api/technicians
Purpose: Search and discover technicians with lightweight filters.

Query parameters:
- skill: Optional skill name to filter by
- category: Optional device category name to filter by
- location: Optional service area/location filter
- available: Optional true/false filter for available status

Example requests:
- GET /api/technicians?skill=screen-replacement
- GET /api/technicians?category=laptop-repair
- GET /api/technicians?location=Colombo
- GET /api/technicians?available=true
- GET /api/technicians?skill=screen-replacement&location=Colombo&available=true

Success response example:
```json
{
  "success": true,
  "message": "Technicians retrieved successfully",
  "data": [
    {
      "technicianId": "tech-001",
      "businessName": "RapidFix Tech",
      "serviceArea": "Colombo",
      "yearsExperience": 7,
      "skills": [{ "id": "skill-1", "name": "Screen Replacement" }]
    }
  ]
}
```

Important validation/error responses:
- 400: Invalid search filters

## Environmental Impact

### GET /api/technicians/{technicianId}/impact
Purpose: Get the technician impact summary containing impact points and sustainability level.

Path parameters:
- technicianId: Required technician identifier

Success response example:
```json
{
  "success": true,
  "message": "Technician impact summary retrieved successfully",
  "data": {
    "impactPoints": 350,
    "sustainabilityLevel": "Silver"
  }
}
```

Important validation/error responses:
- 404: Technician not found
