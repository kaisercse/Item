import { useState, useEffect } from 'react';
import { supabase, type Item, type ItemInput } from '../lib/supabase';
import { Plus, Trash2, ChevronDown } from 'lucide-react';

const ItemSetup = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<ItemInput>>({
    active: true,
    batch_lot_tracking: false,
    expiry_required: false,
    warranty_required: false,
    qc_required: false,
    re_order: false,
    decimal_precision: 2,
    count: 0,
  });

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('items')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) console.error('Error loading items:', error);
    else setItems(data || []);
    setLoading(false);
  };

  const handleSave = async () => {
    if (!formData.item_code || !formData.item_name) {
      alert('Item Code and Item Name are required');
      return;
    }

    setLoading(true);
    try {
      if (selectedItem) {
        const { error } = await supabase
          .from('items')
          .update({
            ...formData,
            updated_at: new Date().toISOString(),
          })
          .eq('id', selectedItem.id);

        if (error) throw error;
      } else {
        const { error } = await supabase.from('items').insert([formData]);
        if (error) throw error;
      }

      resetForm();
      loadItems();
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error saving item:', error);
      alert('Error saving item');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;

    setLoading(true);
    const { error } = await supabase.from('items').delete().eq('id', id);

    if (error) {
      console.error('Error deleting item:', error);
      alert('Error deleting item');
    } else {
      loadItems();
    }
    setLoading(false);
  };

  const openEditModal = (item: Item) => {
    setSelectedItem(item);
    setFormData(item);
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setSelectedItem(null);
    setFormData({
      active: true,
      batch_lot_tracking: false,
      expiry_required: false,
      warranty_required: false,
      qc_required: false,
      re_order: false,
      decimal_precision: 2,
      count: 0,
    });
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    resetForm();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const val =
      type === 'checkbox'
        ? (e.target as HTMLInputElement).checked
        : type === 'number'
          ? value === ''
            ? null
            : Number(value)
          : value;

    setFormData((prev) => ({
      ...prev,
      [name]: val,
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-semibold text-slate-900">Item Setup</h1>
            <p className="text-slate-500 mt-2">Manage your inventory items</p>
          </div>
          <button
            onClick={() => {
              resetForm();
              setIsModalOpen(true);
            }}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-4 rounded-lg transition-colors"
          >
            <Plus size={20} />
            New Item
          </button>
        </div>

        {/* Items Table */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          {loading && items.length === 0 ? (
            <div className="p-12 text-center text-slate-500">Loading items...</div>
          ) : items.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-slate-500 mb-4">No items created yet</p>
              <button
                onClick={() => {
                  resetForm();
                  setIsModalOpen(true);
                }}
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
              >
                <Plus size={18} />
                Create Your First Item
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Item Code</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Item Name</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Category</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Brand</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Price</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Status</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-slate-900">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {items.map((item) => (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-50 transition-colors cursor-pointer"
                      onClick={() => openEditModal(item)}
                    >
                      <td className="px-6 py-4 text-sm font-mono text-slate-700">{item.item_code}</td>
                      <td className="px-6 py-4 text-sm text-slate-900 font-medium">{item.item_name}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">{item.category || '-'}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">{item.brand || '-'}</td>
                      <td className="px-6 py-4 text-sm text-slate-900 font-medium">
                        ${item.sales_price ? item.sales_price.toFixed(2) : '-'}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                            item.active
                              ? 'bg-green-100 text-green-700'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {item.active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(item.id);
                          }}
                          className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors"
                          title="Delete item"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-6 border-b border-blue-100">
              <h2 className="text-2xl font-semibold text-white">
                {selectedItem ? 'Edit Item' : 'New Item'}
              </h2>
              <p className="text-blue-100 text-sm mt-1">
                {selectedItem ? 'Update item details' : 'Create a new inventory item'}
              </p>
            </div>

            <div className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-5">
                  <FormField
                    label="Item Code"
                    name="item_code"
                    value={formData.item_code || ''}
                    onChange={handleInputChange}
                    required
                    disabled={!!selectedItem}
                  />

                  <FormField
                    label="Item Name"
                    name="item_name"
                    value={formData.item_name || ''}
                    onChange={handleInputChange}
                    required
                  />

                  <FormField
                    label="Item Description"
                    name="item_description"
                    value={formData.item_description || ''}
                    onChange={handleInputChange}
                    isTextarea
                  />

                  <FormField
                    label="Group Name"
                    name="group_name"
                    value={formData.group_name || ''}
                    onChange={handleInputChange}
                  />

                  <FormField
                    label="Base UoM"
                    name="base_uom"
                    value={formData.base_uom || ''}
                    onChange={handleInputChange}
                  />

                  <FormField
                    label="Color"
                    name="color"
                    value={formData.color || ''}
                    onChange={handleInputChange}
                  />

                  <FormField
                    label="Purchase UoM"
                    name="purchase_uom"
                    value={formData.purchase_uom || ''}
                    onChange={handleInputChange}
                  />

                  <FormField
                    label="Decimal Precision"
                    name="decimal_precision"
                    type="number"
                    value={formData.decimal_precision || 2}
                    onChange={handleInputChange}
                  />
                </div>

                {/* Right Column */}
                <div className="space-y-5">
                  <FormField
                    label="Category"
                    name="category"
                    value={formData.category || ''}
                    onChange={handleInputChange}
                  />

                  <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <input
                      type="checkbox"
                      name="expiry_required"
                      id="expiry_required"
                      checked={formData.expiry_required || false}
                      onChange={handleInputChange}
                      className="w-4 h-4 rounded cursor-pointer"
                    />
                    <label htmlFor="expiry_required" className="text-sm font-medium text-slate-700 cursor-pointer">
                      Expiry Required
                    </label>
                  </div>

                  <FormField
                    label="Group Name"
                    name="group_name"
                    value={formData.group_name || ''}
                    onChange={handleInputChange}
                  />

                  <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <input
                      type="checkbox"
                      name="warranty_required"
                      id="warranty_required"
                      checked={formData.warranty_required || false}
                      onChange={handleInputChange}
                      className="w-4 h-4 rounded cursor-pointer"
                    />
                    <label htmlFor="warranty_required" className="text-sm font-medium text-slate-700 cursor-pointer">
                      Warranty Required
                    </label>
                  </div>

                  <FormField
                    label="Organic Type"
                    name="organic_type"
                    value={formData.organic_type || ''}
                    onChange={handleInputChange}
                  />

                  <FormField
                    label="Size"
                    name="size"
                    value={formData.size || ''}
                    onChange={handleInputChange}
                  />

                  <FormField
                    label="Sales UoM"
                    name="sales_uom"
                    value={formData.sales_uom || ''}
                    onChange={handleInputChange}
                  />

                  <FormField
                    label="Brand"
                    name="brand"
                    value={formData.brand || ''}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 pt-6 border-t border-slate-200">
                {/* More Fields */}
                <div className="space-y-5">
                  <FormField
                    label="Model"
                    name="model"
                    value={formData.model || ''}
                    onChange={handleInputChange}
                  />

                  <FormField
                    label="Origin"
                    name="origin"
                    value={formData.origin || ''}
                    onChange={handleInputChange}
                  />

                  <FormField
                    label="Manufacturer"
                    name="manufacturer"
                    value={formData.manufacturer || ''}
                    onChange={handleInputChange}
                  />

                  <FormField
                    label="HS Code"
                    name="hs_code"
                    value={formData.hs_code || ''}
                    onChange={handleInputChange}
                  />

                  <FormField
                    label="UoM Conversion"
                    name="uom_conversion"
                    type="number"
                    step="0.01"
                    value={formData.uom_conversion || ''}
                    onChange={handleInputChange}
                  />

                  <FormField
                    label="Purchase Price"
                    name="purchase_price"
                    type="number"
                    step="0.01"
                    value={formData.purchase_price || ''}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="space-y-5">
                  <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <input
                      type="checkbox"
                      name="qc_required"
                      id="qc_required"
                      checked={formData.qc_required || false}
                      onChange={handleInputChange}
                      className="w-4 h-4 rounded cursor-pointer"
                    />
                    <label htmlFor="qc_required" className="text-sm font-medium text-slate-700 cursor-pointer">
                      QC Required
                    </label>
                  </div>

                  <FormField
                    label="Conversion Value"
                    name="conversion_value"
                    type="number"
                    step="0.01"
                    value={formData.conversion_value || ''}
                    onChange={handleInputChange}
                  />

                  <FormField
                    label="Sales Price"
                    name="sales_price"
                    type="number"
                    step="0.01"
                    value={formData.sales_price || ''}
                    onChange={handleInputChange}
                  />

                  <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <input
                      type="checkbox"
                      name="active"
                      id="active"
                      checked={formData.active || false}
                      onChange={handleInputChange}
                      className="w-4 h-4 rounded cursor-pointer"
                    />
                    <label htmlFor="active" className="text-sm font-medium text-slate-700 cursor-pointer">
                      Active
                    </label>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <input
                      type="checkbox"
                      name="re_order"
                      id="re_order"
                      checked={formData.re_order || false}
                      onChange={handleInputChange}
                      className="w-4 h-4 rounded cursor-pointer"
                    />
                    <label htmlFor="re_order" className="text-sm font-medium text-slate-700 cursor-pointer">
                      Re-Order
                    </label>
                  </div>

                  <FormField
                    label="Count"
                    name="count"
                    type="number"
                    value={formData.count || 0}
                    onChange={handleInputChange}
                  />

                  <FormField
                    label="Inventory Valuation Method"
                    name="inventory_valuation_method"
                    value={formData.inventory_valuation_method || ''}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-slate-50 border-t border-slate-200 px-8 py-4 flex justify-end gap-3">
              <button
                onClick={handleCancel}
                className="px-6 py-2.5 text-slate-700 bg-slate-200 hover:bg-slate-300 rounded-lg font-semibold transition-colors"
              >
                Cancel
              </button>
              {selectedItem && (
                <button
                  onClick={() => {
                    if (selectedItem) handleDelete(selectedItem.id);
                    setIsModalOpen(false);
                  }}
                  className="px-6 py-2.5 text-white bg-red-600 hover:bg-red-700 rounded-lg font-semibold transition-colors"
                >
                  Delete
                </button>
              )}
              <button
                onClick={handleSave}
                disabled={loading}
                className="px-6 py-2.5 text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 rounded-lg font-semibold transition-colors"
              >
                {loading ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

interface FormFieldProps {
  label: string;
  name: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  type?: string;
  step?: string;
  required?: boolean;
  disabled?: boolean;
  isTextarea?: boolean;
}

const FormField = ({
  label,
  name,
  value,
  onChange,
  type = 'text',
  step,
  required = false,
  disabled = false,
  isTextarea = false,
}: FormFieldProps) => {
  if (isTextarea) {
    return (
      <div>
        <label htmlFor={name} className="block text-sm font-semibold text-slate-700 mb-2">
          {label}
          {required && <span className="text-red-500">*</span>}
        </label>
        <textarea
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          disabled={disabled}
          rows={3}
          className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none disabled:bg-slate-100"
        />
      </div>
    );
  }

  return (
    <div>
      <label htmlFor={name} className="block text-sm font-semibold text-slate-700 mb-2">
        {label}
        {required && <span className="text-red-500">*</span>}
      </label>
      <input
        id={name}
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        step={step}
        className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-slate-100"
      />
    </div>
  );
};

export default ItemSetup;
