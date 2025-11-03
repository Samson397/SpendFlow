'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { categoryService } from '@/lib/services/categoryService';
import { Category } from '@/types';
import { AuthGate } from '@/components/auth/AuthGate';
import { Plus, Edit2, Trash2, Tag } from 'lucide-react';
import toast from 'react-hot-toast';

function CategoriesPageContent() {
  const { user } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [selectedType, setSelectedType] = useState<'income' | 'expense'>('expense');

  const loadCategories = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      const data = await categoryService.getAllCategories(user.uid, selectedType);
      setCategories(data);
    } catch (error) {
      console.error('Error loading categories:', error);
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  }, [user, selectedType]);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const handleCreateCategory = async (data: { name: string; color: string; icon: string }) => {
    if (!user) return;

    try {
      await categoryService.createCategory(user.uid, {
        ...data,
        type: selectedType,
      });
      await loadCategories();
      setShowModal(false);
      toast.success('Category created successfully');
    } catch (error) {
      console.error('Error creating category:', error);
      toast.error('Failed to create category');
    }
  };

  const handleUpdateCategory = async (data: { name: string; color: string; icon: string }) => {
    if (!editingCategory) return;

    try {
      await categoryService.updateCategory(editingCategory.id, data);
      await loadCategories();
      setEditingCategory(null);
      toast.success('Category updated successfully');
    } catch (error) {
      console.error('Error updating category:', error);
      toast.error('Failed to update category');
    }
  };

  const handleDeleteCategory = async (categoryId: string, categoryName: string) => {
    if (!window.confirm(`Are you sure you want to delete "${categoryName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await categoryService.deleteCategory(categoryId);
      await loadCategories();
      toast.success('Category deleted successfully');
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.error('Failed to delete category');
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 md:space-y-12 px-2 sm:px-4 max-w-7xl mx-auto">
      {/* Header */}
      <div className="text-center px-2 sm:px-4">
        <div className="w-8 sm:w-12 md:w-16 h-0.5 bg-linear-to-r from-transparent via-amber-400 to-transparent mx-auto mb-3 sm:mb-4 md:mb-8"></div>
        <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-serif text-slate-100 mb-2 sm:mb-4 tracking-wide">
          C A T E G O R I E S
        </h1>
        <div className="w-12 sm:w-16 md:w-24 h-0.5 bg-linear-to-r from-transparent via-amber-400 to-transparent mx-auto mb-3 sm:mb-4 md:mb-6"></div>
        <p className="text-slate-400 text-xs sm:text-sm tracking-widest uppercase">Manage Your Transaction Categories</p>
      </div>

      {/* Type Toggle */}
      <div className="flex justify-center mb-8">
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-1">
          <button
            onClick={() => setSelectedType('expense')}
            className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
              selectedType === 'expense'
                ? 'bg-amber-600 text-white'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Expenses
          </button>
          <button
            onClick={() => setSelectedType('income')}
            className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
              selectedType === 'income'
                ? 'bg-green-600 text-white'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Income
          </button>
        </div>
      </div>

      {/* Add Category Button */}
      <div className="flex justify-center mb-8">
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-6 py-3 border border-amber-600 text-amber-400 hover:bg-amber-600/10 transition-colors tracking-wider uppercase text-sm rounded-md"
        >
          <Plus className="h-5 w-5" />
          Add Custom Category
        </button>
      </div>

      {/* Categories Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-amber-400 text-lg font-serif tracking-wider">Loading...</div>
        </div>
      ) : categories.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {categories.map((category) => (
            <div
              key={category.id || category.name}
              className="bg-slate-900/50 border border-slate-800 rounded-lg p-6 hover:border-slate-700 transition-all group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-lg"
                    style={{ backgroundColor: `${category.color}20`, color: category.color }}
                  >
                    {category.icon}
                  </div>
                  <div>
                    <h3 className="font-serif text-slate-100 text-lg">{category.name}</h3>
                    <p className="text-slate-500 text-xs capitalize">{category.type}</p>
                  </div>
                </div>

                {/* Only show edit/delete for custom categories (those with IDs) */}
                {category.id && (
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => setEditingCategory(category)}
                      className="p-1 text-slate-400 hover:text-amber-400 transition-colors"
                      title="Edit category"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteCategory(category.id!, category.name)}
                      className="p-1 text-slate-400 hover:text-red-400 transition-colors"
                      title="Delete category"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* Usage indicator (could show transaction count here) */}
              <div className="text-xs text-slate-500">
                Default category
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 sm:py-16 md:py-20 border border-slate-800 bg-slate-900/30 rounded-lg">
          <div className="text-amber-400 mb-4">
            <Tag className="h-12 w-12 sm:h-16 sm:w-16 mx-auto" />
          </div>
          <h3 className="text-xl sm:text-2xl font-serif text-slate-100 mb-3">No Categories Yet</h3>
          <p className="text-slate-400 mb-6 sm:mb-8 text-sm sm:text-base tracking-wide px-4">
            Start organizing your transactions with custom categories
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="px-6 py-3 border border-amber-600 text-amber-400 hover:bg-amber-600/10 transition-colors tracking-wider uppercase text-sm rounded-md"
          >
            Create Your First Category
          </button>
        </div>
      )}

      {/* Create/Edit Modal */}
      {(showModal || editingCategory) && (
        <CategoryModal
          category={editingCategory}
          type={selectedType}
          onClose={() => {
            setShowModal(false);
            setEditingCategory(null);
          }}
          onSave={editingCategory ? handleUpdateCategory : handleCreateCategory}
        />
      )}
    </div>
  );
}

function CategoryModal({
  category,
  type,
  onClose,
  onSave
}: {
  category?: Category | null;
  type: 'income' | 'expense';
  onClose: () => void;
  onSave: (data: { name: string; color: string; icon: string }) => Promise<void>;
}) {
  const [formData, setFormData] = useState({
    name: category?.name || '',
    color: category?.color || '#6366f1',
    icon: category?.icon || '📦',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    try {
      setLoading(true);
      if (category) {
        await onSave(formData);
      } else {
        await onSave(formData);
      }
    } catch (error) {
      // Error handled in parent
    } finally {
      setLoading(false);
    }
  };

  const colorOptions = [
    '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16', '#22c55e', '#10b981',
    '#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899'
  ];

  const iconOptions = type === 'income'
    ? ['💼', '💻', '📈', '🎁', '💰', '🏦', '💡', '🎯', '🚀', '⭐']
    : ['🍽️', '🚗', '🛍️', '📄', '🎬', '🏥', '📦', '🏠', '☕', '🎵'];

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-serif text-slate-100">
              {category ? 'Edit Category' : 'Create Category'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
            >
              <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name */}
            <div>
              <label htmlFor="category-name" className="block text-slate-400 text-sm font-medium mb-2">
                Category Name
              </label>
              <input
                id="category-name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Travel, Subscriptions, etc."
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 text-slate-100 rounded-lg focus:border-amber-500 focus:outline-none transition-colors"
                required
              />
            </div>

            {/* Color */}
            <div>
              <label className="block text-slate-400 text-sm font-medium mb-3">
                Color
              </label>
              <div id="category-color" className="grid grid-cols-5 gap-3">
                {colorOptions.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setFormData({ ...formData, color })}
                    className={`w-10 h-10 rounded-lg border-2 transition-all ${
                      formData.color === color
                        ? 'border-white scale-110'
                        : 'border-slate-600 hover:border-slate-400'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            {/* Icon */}
            <div>
              <label className="block text-slate-400 text-sm font-medium mb-3">
                Icon
              </label>
              <div id="category-icon" className="grid grid-cols-5 gap-3">
                {iconOptions.map((icon) => (
                  <button
                    key={icon}
                    type="button"
                    onClick={() => setFormData({ ...formData, icon })}
                    className={`w-12 h-12 rounded-lg border-2 transition-all flex items-center justify-center text-xl ${
                      formData.icon === icon
                        ? 'border-amber-500 bg-amber-500/10 scale-110'
                        : 'border-slate-600 hover:border-slate-400'
                    }`}
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-6 py-3 border border-slate-700 text-slate-400 hover:border-slate-600 hover:text-slate-200 transition-colors rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !formData.name.trim()}
                className="flex-1 px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Saving...' : (category ? 'Update' : 'Create')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function CategoriesPage() {
  return (
    <AuthGate>
      <CategoriesPageContent />
    </AuthGate>
  );
}
