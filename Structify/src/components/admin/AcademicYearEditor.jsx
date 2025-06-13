import React, { useState, useEffect } from 'react';
import { Calendar, Edit2, Save, Trash2, PlusCircle, ChevronDown, ChevronUp } from 'lucide-react';

function AcademicYearEditor({ 
  sections, 
  academicYears, 
  onUpdateYear, 
  onDeleteYear, 
  onAddYear,
  isLoading 
}) {
  const [expandedYear, setExpandedYear] = useState(null);
  const [editYear, setEditYear] = useState(null);
  const [newYearName, setNewYearName] = useState('');
  const [newYearInput, setNewYearInput] = useState('');
  const [showAddYear, setShowAddYear] = useState(false);

  // Group sections by academic year
  const sectionsByYear = academicYears.reduce((acc, year) => {
    acc[year] = sections.filter(section => section.academicYear === year);
    return acc;
  }, {});

  // Toggle expanded year section
  const toggleExpand = (year) => {
    if (expandedYear === year) {
      setExpandedYear(null);
    } else {
      setExpandedYear(year);
    }
  };

  // Start editing a year
  const startEdit = (year) => {
    setEditYear(year);
    setNewYearName(year);
  };

  // Cancel editing
  const cancelEdit = () => {
    setEditYear(null);
    setNewYearName('');
  };

  // Save edited year
  const saveEdit = () => {
    if (!newYearName.trim() || newYearName === editYear) {
      cancelEdit();
      return;
    }
    
    onUpdateYear(editYear, newYearName.trim());
    setEditYear(null);
    setNewYearName('');
  };

  // Add new academic year
  const addNewYear = () => {
    if (!newYearInput.trim()) return;
    
    onAddYear(newYearInput.trim());
    setNewYearInput('');
    setShowAddYear(false);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-5">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold text-[#141a35] flex items-center">
          <Calendar className="h-5 w-5 mr-2 text-blue-600" />
          Academic Years
        </h2>
        <button
          onClick={() => setShowAddYear(!showAddYear)}
          className="text-blue-600 hover:text-blue-800 flex items-center text-sm font-medium"
        >
          <PlusCircle className="h-4 w-4 mr-1" />
          Add Year
        </button>
      </div>

      {/* Add new year input */}
      {showAddYear && (
        <div className="mb-4 p-3 bg-blue-50 rounded-md">
          <div className="mb-2 text-sm font-medium text-blue-800">Create New Academic Year</div>
          <div className="flex">
            <input
              type="text"
              value={newYearInput}
              onChange={(e) => setNewYearInput(e.target.value)}
              placeholder="e.g., 2023-2024"
              className="flex-1 px-3 py-1.5 border border-blue-300 rounded-l focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={addNewYear}
              disabled={!newYearInput.trim() || isLoading}
              className="bg-blue-600 text-white px-3 py-1.5 rounded-r hover:bg-blue-700 disabled:bg-blue-400"
            >
              Add
            </button>
          </div>
        </div>
      )}

      {/* Years list */}
      <div className="space-y-3">
        {academicYears.length === 0 ? (
          <div className="text-center py-6 text-gray-500">
            <Calendar className="h-10 w-10 mx-auto text-gray-400 mb-2" />
            <p>No academic years defined yet.</p>
          </div>
        ) : (
          academicYears.map(year => (
            <div key={year} className="border rounded-lg overflow-hidden">
              {/* Year header */}
              <div 
                className={`flex justify-between items-center p-3 cursor-pointer ${
                  expandedYear === year ? 'bg-gray-100' : 'bg-white'
                }`}
                onClick={() => toggleExpand(year)}
              >
                <div className="flex items-center">
                  {editYear === year ? (
                    <input
                      type="text"
                      value={newYearName}
                      onChange={(e) => setNewYearName(e.target.value)}
                      className="px-2 py-1 border rounded"
                      onClick={(e) => e.stopPropagation()}
                    />
                  ) : (
                    <div className="font-medium flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-blue-600" />
                      {year}
                      <span className="ml-2 text-xs text-gray-500">
                        ({sectionsByYear[year]?.length || 0} classes)
                      </span>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center">
                  {editYear === year ? (
                    <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                      <button 
                        onClick={saveEdit}
                        className="p-1 text-green-600 hover:text-green-800"
                        disabled={isLoading}
                      >
                        <Save className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={cancelEdit}
                        className="p-1 text-gray-600 hover:text-gray-800"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                      <button 
                        onClick={() => startEdit(year)}
                        className="p-1 text-blue-600 hover:text-blue-800"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => onDeleteYear(year)}
                        className="p-1 text-red-600 hover:text-red-800"
                        disabled={isLoading}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                  {expandedYear === year ? 
                    <ChevronUp className="h-5 w-5 ml-2 text-gray-500" /> : 
                    <ChevronDown className="h-5 w-5 ml-2 text-gray-500" />
                  }
                </div>
              </div>
              
              {/* Expanded section with class list */}
              {expandedYear === year && (
                <div className="p-3 border-t bg-gray-50">
                  {sectionsByYear[year]?.length > 0 ? (
                    <ul className="divide-y divide-gray-200">
                      {sectionsByYear[year].map(section => (
                        <li key={section.id} className="py-2 px-1 flex justify-between items-center">
                          <div>
                            <div className="font-medium">{section.sectionName}</div>
                            <div className="text-sm text-gray-500">
                              {section.instructor} • {section.studentCount} students
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-gray-500 text-center py-2">
                      No classes in this academic year
                    </p>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default AcademicYearEditor;
