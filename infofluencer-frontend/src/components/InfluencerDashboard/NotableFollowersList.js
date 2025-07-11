import React from 'react';

const NotableFollowersList = ({ followers }) => (
  <div className="bg-white rounded-2xl shadow-lg p-6 w-full">
    <div className="text-lg font-bold text-[#FF6A00] mb-3">Notable Followers</div>
    <ul className="divide-y divide-gray-100">
      {followers.map((f, i) => (
        <li key={f.id || i} className="flex items-center gap-3 py-2">
          <img
            src={f.profile_pic_url || '/default-avatar.png'}
            alt={f.username}
            className="w-10 h-10 rounded-full object-cover border-2 border-orange-200"
          />
          <div className="flex-1">
            <div className="font-semibold text-gray-800 flex items-center gap-1">
              {f.full_name || f.username}
              {f.is_verified && (
                <span className="ml-1 text-blue-500" title="Verified">✔️</span>
              )}
              {f.is_famous && (
                <span className="ml-1 text-yellow-500" title="Famous">★</span>
              )}
            </div>
            <div className="text-xs text-gray-500">@{f.username}</div>
          </div>
        </li>
      ))}
    </ul>
  </div>
);

export default NotableFollowersList; 