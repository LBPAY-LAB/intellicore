'use client';

import React, { useState } from 'react';
import { useQuery } from '@apollo/client/react';
import RelationshipTable from '@/components/relationships/RelationshipTable';
import RelationshipFormModal from '@/components/relationships/RelationshipFormModal';
import RelationshipDeleteDialog from '@/components/relationships/RelationshipDeleteDialog';
import RelationshipDetailsPanel from '@/components/relationships/RelationshipDetailsPanel';
import {
  GET_RELATIONSHIPS,
  RelationshipsResponse,
  ObjectRelationship,
} from '@/lib/graphql/relationships';

/**
 * Hierarchies List View Component
 * Displays relationships in a table format with CRUD operations
 */
const HierarchiesListView: React.FC = () => {
  const [selectedRelationship, setSelectedRelationship] = useState<ObjectRelationship | null>(
    null
  );
  const [editingRelationship, setEditingRelationship] = useState<ObjectRelationship | null>(
    null
  );
  const [deletingRelationship, setDeletingRelationship] = useState<ObjectRelationship | null>(
    null
  );
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [showDetailsPanel, setShowDetailsPanel] = useState(false);

  // Fetch relationships
  const { data, loading, error, refetch } = useQuery<RelationshipsResponse>(
    GET_RELATIONSHIPS,
    {
      variables: { first: 1000 },
      fetchPolicy: 'cache-and-network',
    }
  );

  const relationships = data?.relationships.nodes || [];

  const handleEdit = (relationship: ObjectRelationship) => {
    setEditingRelationship(relationship);
    setIsFormModalOpen(true);
  };

  const handleDelete = (relationship: ObjectRelationship) => {
    setDeletingRelationship(relationship);
  };

  const handleRowClick = (relationship: ObjectRelationship) => {
    setSelectedRelationship(relationship);
    setShowDetailsPanel(true);
  };

  const handleFormSuccess = () => {
    refetch();
    setEditingRelationship(null);
  };

  const handleDeleteSuccess = () => {
    refetch();
    setDeletingRelationship(null);
    if (selectedRelationship?.id === deletingRelationship?.id) {
      setSelectedRelationship(null);
      setShowDetailsPanel(false);
    }
  };

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <h3 className="text-red-700 font-semibold mb-2">Error Loading Relationships</h3>
        <p className="text-red-600 text-sm mb-4">{error.message}</p>
        <button
          onClick={() => refetch()}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600">
            Manage all object type relationships in table format
          </p>
        </div>
        <button
          onClick={() => {
            setEditingRelationship(null);
            setIsFormModalOpen(true);
          }}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          Create Relationship
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <div className="text-sm text-gray-600 mb-1">Total Relationships</div>
          <div className="text-2xl font-bold text-gray-900">
            {data?.relationships.totalCount || 0}
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <div className="text-sm text-gray-600 mb-1">Active</div>
          <div className="text-2xl font-bold text-green-600">
            {relationships.filter((r: ObjectRelationship) => r.is_active).length}
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <div className="text-sm text-gray-600 mb-1">Bidirectional</div>
          <div className="text-2xl font-bold text-blue-600">
            {relationships.filter((r: ObjectRelationship) => r.is_bidirectional).length}
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <div className="text-sm text-gray-600 mb-1">Inactive</div>
          <div className="text-2xl font-bold text-gray-400">
            {relationships.filter((r: ObjectRelationship) => !r.is_active).length}
          </div>
        </div>
      </div>

      {/* Table and Details */}
      <div className="grid grid-cols-12 gap-4">
        <div className={showDetailsPanel ? 'col-span-12 lg:col-span-8' : 'col-span-12'}>
          <RelationshipTable
            relationships={relationships}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onRowClick={handleRowClick}
            loading={loading}
          />
        </div>

        {showDetailsPanel && selectedRelationship && (
          <div className="col-span-12 lg:col-span-4">
            <RelationshipDetailsPanel
              relationship={selectedRelationship}
              onEdit={() => handleEdit(selectedRelationship)}
              onDelete={() => handleDelete(selectedRelationship)}
              onClose={() => {
                setShowDetailsPanel(false);
                setSelectedRelationship(null);
              }}
            />
          </div>
        )}
      </div>

      {/* Modals */}
      <RelationshipFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setEditingRelationship(null);
        }}
        onSuccess={handleFormSuccess}
        editingRelationship={editingRelationship || undefined}
      />

      <RelationshipDeleteDialog
        isOpen={!!deletingRelationship}
        relationship={deletingRelationship}
        onClose={() => setDeletingRelationship(null)}
        onSuccess={handleDeleteSuccess}
      />
    </div>
  );
};

export default HierarchiesListView;
