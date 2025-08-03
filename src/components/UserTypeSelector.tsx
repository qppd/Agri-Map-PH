'use client';

import { UserType } from '@/types';
import { USER_TYPES } from '@/data/products';
import { Users, ShoppingCart, Tractor } from 'lucide-react';

interface UserTypeSelectorProps {
  selectedUserType: UserType | null;
  onUserTypeSelect: (userType: UserType) => void;
}

const iconMap = {
  buyer: ShoppingCart,
  farmer: Tractor,
  regular: Users,
};

const colorMap = {
  buyer: 'from-blue-500 to-blue-600',
  farmer: 'from-green-500 to-green-600',
  regular: 'from-purple-500 to-purple-600',
};

export default function UserTypeSelector({ selectedUserType, onUserTypeSelect }: UserTypeSelectorProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
        Sino ka sa AgriMap PH?
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {USER_TYPES.map((userType) => {
          const Icon = iconMap[userType.value];
          const isSelected = selectedUserType === userType.value;
          
          return (
            <button
              key={userType.value}
              onClick={() => onUserTypeSelect(userType.value)}
              className={`
                relative p-6 rounded-xl text-white font-semibold
                transform transition-all duration-200 hover:scale-105 active:scale-95
                ${isSelected ? 'ring-4 ring-white ring-opacity-50 scale-105' : ''}
                bg-gradient-to-br ${colorMap[userType.value]}
                hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-opacity-50
              `}
            >
              <div className="flex flex-col items-center space-y-3">
                <Icon size={48} className="text-white" />
                <div className="text-center">
                  <h3 className="text-xl font-bold">{userType.label}</h3>
                  <p className="text-sm opacity-90 mt-1">{userType.description}</p>
                </div>
              </div>
              
              {isSelected && (
                <div className="absolute top-2 right-2">
                  <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  </div>
                </div>
              )}
            </button>
          );
        })}
      </div>
      
      {selectedUserType && (
        <div className="text-center pt-4">
          <p className="text-gray-600">
            Napili mo: <span className="font-semibold text-gray-800">
              {USER_TYPES.find(ut => ut.value === selectedUserType)?.label}
            </span>
          </p>
        </div>
      )}
    </div>
  );
}
