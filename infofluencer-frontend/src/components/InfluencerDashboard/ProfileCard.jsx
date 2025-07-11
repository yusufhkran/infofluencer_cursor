import React from 'react';

const ProfileCard = ({ name, username, profilePic, followers, location, email, biography, website }) => {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 flex flex-col items-center gap-4 border border-orange-50 min-h-[320px] w-full hover:shadow-xl transition-all duration-300">
      <div className="relative">
        <img
          src={profilePic || '/avatar.png'}
          alt={name || username}
          className="w-24 h-24 rounded-full border-4 border-[#FF6A00] shadow-lg object-cover mb-2 hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
          <span className="text-white text-xs">✓</span>
        </div>
      </div>
      <div className="text-center">
        <div className="text-2xl font-bold text-[#1F1F1F] mb-1">{name || username}</div>
        <div className="text-sm text-gray-500 mb-2">@{username}</div>
        <div className="flex items-center justify-center gap-2 text-gray-600 text-sm mb-3">
          <span className="font-semibold text-[#FF6A00] text-lg">{followers?.toLocaleString()}</span>
          <span className="text-gray-500">Takipçi</span>
        </div>
      </div>
      
      {location && (location.city || location.country) && (
        <div className="flex items-center gap-1 text-xs text-gray-400">
          <span>📍</span>
          <span>{location.city}{location.city && location.country ? ', ' : ''}{location.country}</span>
        </div>
      )}
      
      {email && (
        <div className="flex items-center gap-1 text-xs text-gray-400">
          <span>📧</span>
          <span>{email}</span>
        </div>
      )}
      
      {biography && (
        <div className="text-xs text-gray-600 text-center leading-relaxed max-w-full">
          {biography.length > 100 ? `${biography.substring(0, 100)}...` : biography}
        </div>
      )}
      
      {website && (
        <a 
          href={website} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="text-xs text-blue-500 hover:text-blue-700 hover:underline mt-2 transition-colors duration-200"
        >
          🌐 {website}
        </a>
      )}
    </div>
  );
};

export default ProfileCard; 