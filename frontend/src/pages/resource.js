import React, { useState, useEffect, useMemo } from 'react';
import { fetchDocuments, insertDocument } from '../services/backendApi';
import {
  Input,
  TextareaAutosize,
  Select,
  MenuItem,
  Checkbox,
  Button,
  Card,
  CardContent,
  CardHeader,
  Typography,
  FormControl,
  InputLabel,
  FormControlLabel,
  Divider
} from '@mui/material';
import { useLocation } from 'react-router-dom';
import { userdata } from './Home/Signpage';
import { ROLES } from '../constants/roles';
import { getStoredUser } from '../utils/authSession';

const RESOURCE_CATEGORIES = {
  'Physical Infrastructure': [
    'Laboratory Space',
    'Prototyping Workshop',
    'Conference Rooms',
    'Clean Room Facility',
    'Innovation Sandbox'
  ],
  'Technical Equipment': [
    '3D Printers',
    'High-Performance Computers',
    'Spectroscopy Tools',
    'Electronic Design Workstations'
  ],
  'Digital Resources': [
    'Cloud Credits',
    'AI/ML Platforms',
    'Data Analytics Tools',
    'Advanced Simulation Software'
  ],
  'Legal and IP Support': [
    'Patent Filing Assistance',
    'Trademark Registration Support',
    'Compliance Guidance'
  ],
  'Networking and Mentorship': [
    'Mentorship Programs',
    'Investor Connections',
    'Global Market Access'
  ]
};

const ResourceRequestForm = () => {
  const location = useLocation();
  const routeState = location.state || {};
  const currentUser = getStoredUser();
  const startupIdFromRoute = routeState.startupId || routeState.id || '';
  const normalizedRole = String(currentUser?.role || userdata?.role || '').trim().toLowerCase();

  const [formData, setFormData] = useState({
    requestedResources: [],
    additionalResource: '',
    urgencyLevel: 'medium',
    resourceJustification: '',
    additionalDetails: '',
    timeAndDateNeeded: ''
  });

  const [errors, setErrors] = useState({});
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedInstituteName, setSelectedInstituteName] = useState('');
  const [filteredInstitutes, setFilteredInstitutes] = useState([]);
  const [allInstitutes, setAllInstitutes] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [startupContext, setStartupContext] = useState({
    id: startupIdFromRoute,
    name: routeState.startupName || routeState.name || '',
    founderEmail: routeState.founderEmail || String(currentUser?.email || userdata?.email || ''),
    requestedByName: String(currentUser?.name || userdata?.name || ''),
  });

  const formatDate = (date) => date.toISOString().split('T')[0];
  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();

  useEffect(() => {
    const initializeForm = async () => {
      try {
        setIsLoading(true);

        const [instituteResponse, startupResponse] = await Promise.all([
          fetchDocuments({
            collectionName: 'institute',
            condition: {},
            projection: {}
          }),
          fetchDocuments({
            collectionName: 'startup',
            condition: startupIdFromRoute
              ? { _id: startupIdFromRoute }
              : { founderuserid: String(userdata?.email || '').trim() },
            projection: { _id: 1, name: 1, founderuserid: 1 }
          })
        ]);

        if (!instituteResponse.success) {
          throw new Error('Failed to fetch institutes');
        }

        const institutes = Array.isArray(instituteResponse.data) ? instituteResponse.data : [];
        setAllInstitutes(institutes);
        setFilteredInstitutes(institutes);

        if (startupResponse.success) {
          const startups = Array.isArray(startupResponse.data) ? startupResponse.data : [];
          const startupDoc = startups[0];
          if (startupDoc) {
            setStartupContext((prev) => ({
              ...prev,
              id: String(startupDoc._id || prev.id || ''),
              name: startupDoc.name || prev.name,
              founderEmail: startupDoc.founderuserid || prev.founderEmail,
            }));
          }
        }
      } catch (err) {
        console.error('Error initializing resource form:', err);
        setError('Failed to load resource request form data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    initializeForm();
  }, [startupIdFromRoute]);

  const daysInMonth = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const totalDays = getDaysInMonth(year, month);
    return Array.from({ length: totalDays }, (_, i) => new Date(year, month, i + 1));
  }, [currentMonth]);

  const selectedInstitute = useMemo(
    () => allInstitutes.find((institute) => institute.name === selectedInstituteName) || null,
    [allInstitutes, selectedInstituteName]
  );

  useEffect(() => {
    const filtered = allInstitutes.filter((institute) => {
      const instituteDates = Array.isArray(institute?.availableDates) ? institute.availableDates : [];
      return instituteDates.some((dateRange) => {
        const start = new Date(dateRange.start);
        return start.getMonth() === currentMonth.getMonth() && start.getFullYear() === currentMonth.getFullYear();
      });
    });

    setFilteredInstitutes(filtered);
  }, [currentMonth, allInstitutes]);

  const handleResourceToggle = (resource) => {
    setFormData((prev) => {
      const currentResources = prev.requestedResources;
      const newResources = currentResources.includes(resource)
        ? currentResources.filter((r) => r !== resource)
        : [...currentResources, resource];

      return { ...prev, requestedResources: newResources };
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (formData.requestedResources.length === 0 && !formData.additionalResource.trim()) {
      newErrors.requestedResources = 'Please select at least one resource or specify an additional one.';
    }
    if (!formData.resourceJustification.trim()) {
      newErrors.resourceJustification = 'Resource justification is required.';
    }
    if (!formData.timeAndDateNeeded) {
      newErrors.timeAndDateNeeded = 'Please select a time and date for the resources.';
    }
    if (!selectedInstituteName) {
      newErrors.institute = 'Please select an institute.';
    }
    if (!startupContext.id) {
      newErrors.startup = 'Startup details are missing. Open this form from your startup profile.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      const resourceRequestData = {
        categories: [
          ...formData.requestedResources,
          ...(formData.additionalResource ? [formData.additionalResource] : [])
        ],
        reason: formData.resourceJustification,
        urgency: formData.urgencyLevel.charAt(0).toUpperCase() + formData.urgencyLevel.slice(1),
        date: new Date().toISOString().split('T')[0],
        startupRequestingid: startupContext.id,
        startupName: startupContext.name,
        founderuserid: startupContext.founderEmail,
        requestRaisedByEmail: String(currentUser?.email || userdata?.email || startupContext.founderEmail || ''),
        requestRaisedByName: String(currentUser?.name || userdata?.name || startupContext.requestedByName || ''),
        institute: selectedInstituteName,
        selectedDate: formData.timeAndDateNeeded ? new Date(formData.timeAndDateNeeded).toISOString().split('T')[0] : '',
        verified: false,
        status: 'pending',
        additionalDetails: formData.additionalDetails || '',
        createdAt: new Date().toISOString(),
      };

      const response = await insertDocument({
        collectionName: 'resources',
        data: resourceRequestData
      });

      if (!response.success) {
        alert('Failed to submit resource request');
        return;
      }

      alert('Resource request submitted successfully!');
      setFormData({
        requestedResources: [],
        additionalResource: '',
        urgencyLevel: 'medium',
        resourceJustification: '',
        additionalDetails: '',
        timeAndDateNeeded: ''
      });
      setErrors({});
      setSelectedInstituteName('');
      setSelectedDate(null);
    } catch (submitError) {
      console.error('Error submitting resource request:', submitError);
      alert('Error submitting resource request');
    }
  };

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    const filtered = allInstitutes.filter((institute) =>
      (Array.isArray(institute?.availableDates) ? institute.availableDates : []).some((dateRange) => {
        const start = new Date(dateRange.start);
        const end = new Date(dateRange.end);
        return date >= start && date <= end;
      })
    );
    setFilteredInstitutes(filtered);
  };

  const renderCalendarDays = () => {
    const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();

    return (
      <>
        {[...Array(firstDayOfMonth)].map((_, index) => (
          <div key={`empty-${index}`} className="p-2 bg-gray-100"></div>
        ))}
        {daysInMonth.map((day) => {
          const isSelected = selectedDate && formatDate(day) === formatDate(selectedDate);
          const hasAvailableInstitutes = filteredInstitutes.some((institute) =>
            (Array.isArray(institute?.availableDates) ? institute.availableDates : []).some((dateRange) => {
              const start = new Date(dateRange.start);
              const end = new Date(dateRange.end);
              return day >= start && day <= end;
            })
          );

          return (
            <div
              key={day.toString()}
              className={`p-2 border cursor-pointer ${isSelected ? 'bg-blue-200' : hasAvailableInstitutes ? 'bg-green-100' : 'bg-gray-100'}`}
              onClick={() => handleDateSelect(day)}
            >
              {day.getDate()}
            </div>
          );
        })}
      </>
    );
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-4">
        <Typography variant="h6">Loading resource form...</Typography>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <Typography variant="h6" color="error">{error}</Typography>
      </div>
    );
  }

  if (normalizedRole !== ROLES.STARTUP && normalizedRole !== ROLES.ADMIN) {
    return (
      <div className="container mx-auto p-4">
        <Typography variant="h6" color="error">Only startup and admin users can submit resource requests.</Typography>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader
          title="Resource Request Form"
          subheader="Submit your startup resource requirements for policy review"
          style={{ textAlign: 'center', padding: '20px 0' }}
        />
        <CardContent>
          <form onSubmit={handleSubmit}>
            <Typography variant="h6" gutterBottom>Startup Details</Typography>
            <FormControl style={{ marginBottom: '20px', width: '100%' }}>
              <InputLabel htmlFor="startupName">Startup Name</InputLabel>
              <Input id="startupName" value={startupContext.name} disabled />
            </FormControl>
            <FormControl style={{ marginBottom: '20px', width: '100%' }}>
              <InputLabel htmlFor="founderEmail">Founder Email</InputLabel>
              <Input id="founderEmail" value={startupContext.founderEmail} disabled />
            </FormControl>
            {errors.startup && (
              <Typography color="error" variant="body2">{errors.startup}</Typography>
            )}

            <Divider style={{ margin: '20px 0' }} />

            <Typography variant="h6" gutterBottom>Select Required Resources</Typography>
            {Object.entries(RESOURCE_CATEGORIES).map(([category, resources]) => (
              <div key={category} style={{ marginBottom: '20px' }}>
                <Typography variant="subtitle1" style={{ marginBottom: '10px' }}>{category}</Typography>
                {resources.map((resource) => (
                  <FormControlLabel
                    key={resource}
                    control={
                      <Checkbox
                        checked={formData.requestedResources.includes(resource)}
                        onChange={() => handleResourceToggle(resource)}
                      />
                    }
                    label={resource}
                  />
                ))}
              </div>
            ))}

            <FormControl style={{ marginBottom: '20px', width: '100%' }}>
              <InputLabel htmlFor="additionalResource">Other Resource (if not listed)</InputLabel>
              <Input
                id="additionalResource"
                name="additionalResource"
                value={formData.additionalResource}
                onChange={handleChange}
                placeholder="Specify additional resource"
              />
            </FormControl>
            {errors.requestedResources && (
              <Typography color="error" variant="body2">{errors.requestedResources}</Typography>
            )}

            <Divider style={{ margin: '20px 0' }} />

            <Typography variant="h6" gutterBottom>Resource Justification</Typography>
            <TextareaAutosize
              name="resourceJustification"
              value={formData.resourceJustification}
              onChange={handleChange}
              placeholder="Explain why these resources are needed"
              minRows={4}
              style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
            />
            {errors.resourceJustification && (
              <Typography color="error" variant="body2">{errors.resourceJustification}</Typography>
            )}

            <Divider style={{ margin: '20px 0' }} />

            <Typography variant="h6" gutterBottom>Additional Details</Typography>
            <TextareaAutosize
              name="additionalDetails"
              value={formData.additionalDetails}
              onChange={handleChange}
              placeholder="Provide any additional information or context"
              minRows={3}
              style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
            />

            <Divider style={{ margin: '20px 0' }} />

            <div className="mb-4">
              <h2 className="text-xl font-semibold mb-2">Select Available Date</h2>
              <div className="flex items-center justify-between mb-2">
                <button
                  type="button"
                  onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                  className="bg-gray-200 px-4 py-2 rounded"
                >
                  Previous Month
                </button>
                <h3>{currentMonth.toLocaleString('default', { month: 'long' })} {currentMonth.getFullYear()}</h3>
                <button
                  type="button"
                  onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                  className="bg-gray-200 px-4 py-2 rounded"
                >
                  Next Month
                </button>
              </div>
              <div className="grid grid-cols-7 gap-2">
                {renderCalendarDays()}
              </div>
            </div>

            <Typography variant="h6" gutterBottom>Select Institute</Typography>
            <FormControl fullWidth style={{ marginBottom: '20px' }}>
              <InputLabel>Available Institutes</InputLabel>
              <Select
                value={selectedInstituteName}
                onChange={(e) => setSelectedInstituteName(e.target.value)}
                label="Available Institutes"
              >
                {filteredInstitutes.map((institute) => (
                  <MenuItem key={institute.name} value={institute.name}>
                    {institute.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            {errors.institute && (
              <Typography color="error" variant="body2">{errors.institute}</Typography>
            )}

            <div>
              <Typography variant="h6" className="mb-3">Specific Date and Time When Needed</Typography>
              <Input
                type="datetime-local"
                name="timeAndDateNeeded"
                value={formData.timeAndDateNeeded}
                onChange={handleChange}
                fullWidth
              />
              {errors.timeAndDateNeeded && (
                <Typography variant="caption" color="error">{errors.timeAndDateNeeded}</Typography>
              )}
            </div>

            <FormControl style={{ marginBottom: '20px', width: '100%' }}>
              <InputLabel>Urgency Level</InputLabel>
              <Select
                name="urgencyLevel"
                value={formData.urgencyLevel}
                onChange={handleChange}
              >
                <MenuItem value="low">Low</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="high">High</MenuItem>
                <MenuItem value="critical">Critical</MenuItem>
              </Select>
            </FormControl>

            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              style={{ marginTop: '20px' }}
            >
              Submit Resource Request
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResourceRequestForm;
