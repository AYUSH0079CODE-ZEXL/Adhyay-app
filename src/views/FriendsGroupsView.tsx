import React, { useState, useEffect } from 'react';
import {
  Users,
  UserPlus,
  Copy,
  Check,
  Search,
  MessageSquare,
  Shield,
  Flame,
  Award,
  BookOpen,
  Send,
  Plus,
  X,
  Share2,
  Trash2,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { apiUrl } from '../lib/api';

export const FriendsGroupsView: React.FC = () => {
  const { user: userProfile, showToast, addXP } = useApp();

  const [activeTab, setActiveTab] = useState<'friends' | 'groups'>('friends');
  const [copiedCode, setCopiedCode] = useState(false);

  // Friends state
  const [friendCodeInput, setFriendCodeInput] = useState('');
  const [friendsList, setFriendsList] = useState<any[]>([]);
  const [friendRequests, setFriendRequests] = useState<any[]>([]);
  const [isSendingRequest, setIsSendingRequest] = useState(false);

  // Groups state
  const [groups, setGroups] = useState<any[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<any | null>(null);
  const [groupMessageInput, setGroupMessageInput] = useState('');
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupCategory, setNewGroupCategory] = useState('Physics');
  const [newGroupDesc, setNewGroupDesc] = useState('');

  // Fetch friends and groups from backend
  const refreshFriends = async () => {
    try {
      const res = await fetch(apiUrl(`/api/friends/list?userId=${userProfile.id || 'user_default'}`));
      const data = await res.json();
      if (data.success) {
        setFriendsList(data.friends || []);
        setFriendRequests(data.requests || []);
      }
    } catch (e) {
      console.error('Error fetching friends:', e);
    }
  };

  const refreshGroups = async () => {
    try {
      const res = await fetch(apiUrl(`/api/groups/list?userId=${userProfile.id || 'user_default'}`));
      const data = await res.json();
      if (data.success) {
        setGroups(data.groups || []);
        if (data.groups.length > 0 && !selectedGroup) {
          setSelectedGroup(data.groups[0]);
        }
      }
    } catch (e) {
      console.error('Error fetching groups:', e);
    }
  };


  useEffect(() => {
    refreshFriends();
    refreshGroups();
  }, [userProfile.id]);

  // Copy friend code
  const myFriendCode = userProfile.friendCode || 'ADHYAY-7482';
  const handleCopyCode = () => {
    navigator.clipboard.writeText(myFriendCode);
    setCopiedCode(true);
    showToast('Friend Code copied to clipboard!', 'success');
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // Send friend request
  const handleSendFriendRequest = async () => {
    if (!friendCodeInput.trim()) return;
    setIsSendingRequest(true);
    try {
      const res = await fetch(apiUrl('/api/friends/request'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          friendCodeOrUsername: friendCodeInput.trim(),
          userId: userProfile.id || 'user_default',
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(data.message || 'Friend request sent!', 'success');
        setFriendCodeInput('');
      } else {
        showToast(data.message || 'Could not send request', 'warning');
      }
    } catch (e) {
      showToast('Failed to send request. Check connection.', 'error');
    } finally {
      setIsSendingRequest(false);
    }
  };

  // Accept or decline request
  const handleRespondRequest = async (requestId: string, action: 'accept' | 'decline') => {
    try {
      const res = await fetch(apiUrl('/api/friends/respond'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId, action }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(data.message, 'success');
        if (action === 'accept') addXP(50, 'Made a new study partner');
        refreshFriends();
      }
    } catch (e) {
      showToast('Error responding to request', 'error');
    }
  };

  // Remove friend
  const handleRemoveFriend = async (friendId: string) => {
    try {
      await fetch(apiUrl('/api/friends/remove'), {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: userProfile.id || 'user_default', friendId }),
      });
      showToast('Friend removed from your study circle.', 'info');
      refreshFriends();
    } catch (e) {
      showToast('Failed to remove friend', 'error');
    }
  };

  // Send group message
  const handleSendGroupMessage = async () => {
    if (!groupMessageInput.trim() || !selectedGroup) return;
    const text = groupMessageInput.trim();
    setGroupMessageInput('');

    try {
      const res = await fetch(apiUrl(`/api/groups/${selectedGroup.id}/messages`), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          userId: userProfile.id || 'user_default',
        }),
      });
      const data = await res.json();
      if (data.success && data.message) {
        setSelectedGroup((prev: any) => ({
          ...prev,
          messages: [...prev.messages, data.message],
        }));
        refreshGroups();
      }
    } catch (e) {
      showToast('Failed to send message', 'error');
    }
  };

  // Create study group
  const handleCreateGroup = async () => {
    if (!newGroupName.trim()) {
      showToast('Please provide a group name', 'warning');
      return;
    }
    try {
      const res = await fetch(apiUrl('/api/groups/create'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newGroupName.trim(),
          description: newGroupDesc.trim(),
          category: newGroupCategory,
          userId: userProfile.id || 'user_default',
        }),
      });

      const data = await res.json();
      if (data.success && data.group) {
        showToast(`Created "${data.group.name}"!`, 'success');
        setShowCreateGroupModal(false);
        setNewGroupName('');
        setNewGroupDesc('');
        refreshGroups();
        setSelectedGroup(data.group);
      }
    } catch (e) {
      showToast('Failed to create study group', 'error');
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="space-y-1">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-semibold">
          <Users className="w-3.5 h-3.5 text-orange-400" />
          <span>Real Social Study Network</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Friends & Study Groups
        </h1>
        <p className="text-gray-400 text-sm max-w-2xl">
          Connect with your study peers using unique Friend Codes, share notes, challenge friends, and collaborate in subject study groups.
        </p>
      </div>

      {/* Friend Code Banner */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#141926] via-[#1a2030] to-[#141926] border border-orange-500/25 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-orange-500/20 border border-orange-500/30 flex items-center justify-center shrink-0">
            <Shield className="w-6 h-6 text-orange-400" />
          </div>
          <div>
            <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">Your ADHYAY Friend Code</div>
            <div className="text-lg sm:text-xl font-mono font-extrabold text-white tracking-widest">
              {myFriendCode}
            </div>
            <p className="text-[11px] text-gray-400">Share this code with friends so they can add you instantly.</p>
          </div>
        </div>

        <button
          onClick={handleCopyCode}
          className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 active:scale-95 text-white text-xs font-bold transition-all flex items-center justify-center gap-2 shrink-0 shadow-md shadow-orange-500/20"
        >
          {copiedCode ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          <span>{copiedCode ? 'Copied!' : 'Copy Code'}</span>
        </button>
      </div>

      {/* Navigation Switch */}
      <div className="flex items-center gap-2 border-b border-[#1f2430] pb-2">
        <button
          onClick={() => setActiveTab('friends')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'friends'
              ? 'bg-orange-500/15 text-orange-400 border border-orange-500/30'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Study Friends ({friendsList.length})</span>
          {friendRequests.length > 0 && (
            <span className="w-2 h-2 rounded-full bg-orange-500" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('groups')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'groups'
              ? 'bg-orange-500/15 text-orange-400 border border-orange-500/30'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Study Groups ({groups.length})</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: FRIENDS */}
      {/* ========================================================================= */}
      {activeTab === 'friends' && (
        <div className="space-y-6">
          {/* Add Friend Input */}
          <div className="p-5 rounded-2xl bg-[#11141c] border border-[#212736] space-y-3">
            <h3 className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-orange-400" /> Add a Study Friend
            </h3>
            <div className="flex flex-col sm:flex-row gap-2.5">
              <input
                type="text"
                value={friendCodeInput}
                onChange={(e) => setFriendCodeInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendFriendRequest()}
                placeholder="Enter Friend Code (e.g. ADHYAY-9921) or username"
                className="flex-1 px-4 py-2.5 rounded-xl bg-[#161a24] border border-[#272f40] text-white text-xs placeholder-gray-500 focus:outline-none focus:border-orange-500 transition-colors font-mono"
              />
              <button
                onClick={handleSendFriendRequest}
                disabled={!friendCodeInput.trim() || isSendingRequest}
                className="px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 active:scale-95 disabled:opacity-50 text-white text-xs font-bold transition-all flex items-center justify-center gap-2"
              >
                <UserPlus className="w-4 h-4" />
                <span>{isSendingRequest ? 'Sending...' : 'Send Request'}</span>
              </button>
            </div>
          </div>

          {/* Pending Friend Requests */}
          {friendRequests.length > 0 && (
            <div className="p-4 rounded-2xl bg-[#161720] border border-orange-500/30 space-y-3">
              <span className="text-xs font-bold text-orange-400 uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5" /> Pending Friend Requests ({friendRequests.length})
              </span>
              <div className="space-y-2">
                {friendRequests.map((req) => (
                  <div
                    key={req.id}
                    className="p-3 rounded-xl bg-[#12141c] border border-[#222736] flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={req.senderAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
                        alt={req.senderName}
                        className="w-9 h-9 rounded-full object-cover border border-orange-500/30"
                      />
                      <div>
                        <h4 className="text-xs font-bold text-white">{req.senderName}</h4>
                        <p className="text-[10px] text-gray-400">Wants to be study partners</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleRespondRequest(req.id, 'accept')}
                        className="px-3 py-1.5 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold hover:bg-emerald-500/30 transition-colors"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => handleRespondRequest(req.id, 'decline')}
                        className="px-3 py-1.5 rounded-lg bg-red-500/15 border border-red-500/30 text-red-300 text-xs font-bold hover:bg-red-500/25 transition-colors"
                      >
                        Decline
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Friends List */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Connected Study Partners ({friendsList.length})
            </h3>

            {friendsList.length === 0 ? (
              <div className="p-8 rounded-2xl bg-[#11141c] border border-[#212736] text-center space-y-2">
                <Users className="w-8 h-8 text-gray-400 mx-auto" />
                <p className="text-xs font-semibold text-gray-300">No study friends added yet.</p>
                <p className="text-[11px] text-gray-400">
                  Share your Friend Code with classmates or add them using their code above!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {friendsList.map((friend) => (
                  <div
                    key={friend.friendId}
                    className="p-4 rounded-xl bg-[#11141c] border border-[#212736] hover:border-[#2f384d] transition-all flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={friend.friendAvatar || 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150'}
                        alt={friend.friendName}
                        className="w-10 h-10 rounded-full object-cover border border-[#2d3648]"
                      />
                      <div className="space-y-0.5">
                        <h4 className="text-xs font-bold text-white">{friend.friendName}</h4>
                        <div className="flex items-center gap-2 text-[10px] text-gray-400">
                          <span className="font-mono text-orange-400">{friend.friendCode}</span>
                          <span>•</span>
                          <span className="flex items-center gap-0.5 text-amber-300 font-semibold">
                            <Flame className="w-3 h-3 text-orange-500" /> {friend.friendStreak}d streak
                          </span>
                          <span>•</span>
                          <span className="text-blue-300 font-semibold">Lvl {friend.friendLevel}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => {
                          showToast(`Challenge sent to ${friend.friendName}!`, 'success');
                        }}
                        className="p-2 rounded-lg bg-[#181d28] hover:bg-orange-500/20 text-gray-300 hover:text-orange-400 transition-colors"
                        title="Challenge to Quick Recall"
                      >
                        <Award className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleRemoveFriend(friend.friendId)}
                        className="p-2 rounded-lg bg-[#181d28] hover:bg-red-500/20 text-gray-400 hover:text-red-400 transition-colors"
                        title="Remove Friend"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: STUDY GROUPS */}
      {/* ========================================================================= */}
      {activeTab === 'groups' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Your Study Circles
            </h3>
            <button
              onClick={() => setShowCreateGroupModal(true)}
              className="px-3.5 py-1.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-md shadow-orange-500/20"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Group</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Groups Sidebar */}
            <div className="lg:col-span-4 space-y-2">
              {groups.map((grp) => {
                const isSelected = selectedGroup?.id === grp.id;
                return (
                  <button
                    key={grp.id}
                    onClick={() => setSelectedGroup(grp)}
                    className={`w-full p-3.5 rounded-xl border text-left transition-all space-y-1 block ${
                      isSelected
                        ? 'bg-orange-500/10 border-orange-500/40 text-white'
                        : 'bg-[#11141c] border-[#212736] text-gray-300 hover:bg-[#161a24]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white truncate">{grp.name}</span>
                      <span className="px-1.5 py-0.2 rounded bg-[#181d28] text-[9px] text-orange-400 font-semibold uppercase">
                        {grp.category}
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-400 line-clamp-1">{grp.description}</p>
                    <span className="text-[10px] text-gray-400 block font-mono">
                      {grp.members?.length || 1} members • Code: {grp.inviteCode}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Active Group Chat Room */}
            <div className="lg:col-span-8 bg-[#11141c] rounded-2xl border border-[#212736] p-4 flex flex-col justify-between min-h-[420px]">
              {selectedGroup ? (
                <>
                  {/* Group Header */}
                  <div className="pb-3 border-b border-[#212736] flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-white">{selectedGroup.name}</h3>
                      <p className="text-[11px] text-gray-400">{selectedGroup.description}</p>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-orange-500/10 text-orange-400 text-[10px] font-bold">
                      Invite: {selectedGroup.inviteCode}
                    </span>
                  </div>

                  {/* Messages Feed */}
                  <div className="flex-1 py-4 space-y-3 overflow-y-auto max-h-[300px] pr-1">
                    {selectedGroup.messages?.map((msg: any) => {
                      const isMe = msg.senderId === (userProfile.id || 'user_default');
                      return (
                        <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                          <div
                            className={`max-w-[80%] p-3 rounded-xl text-xs space-y-1 ${
                              isMe
                                ? 'bg-orange-500 text-white rounded-tr-none'
                                : 'bg-[#181d28] text-gray-200 border border-[#273042] rounded-tl-none'
                            }`}
                          >
                            {!isMe && (
                              <span className="text-[10px] font-bold text-orange-400 block">
                                {msg.senderName}
                              </span>
                            )}
                            <p className="leading-relaxed">{msg.text}</p>
                            <span className="text-[9px] opacity-70 block text-right">
                              {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Message Input */}
                  <div className="pt-3 border-t border-[#212736] flex gap-2">
                    <input
                      type="text"
                      value={groupMessageInput}
                      onChange={(e) => setGroupMessageInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSendGroupMessage()}
                      placeholder={`Message ${selectedGroup.name}...`}
                      className="flex-1 px-4 py-2.5 rounded-xl bg-[#161a24] border border-[#272f40] text-white text-xs placeholder-gray-500 focus:outline-none focus:border-orange-500 transition-colors"
                    />
                    <button
                      onClick={handleSendGroupMessage}
                      disabled={!groupMessageInput.trim()}
                      className="px-4 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 disabled:opacity-40 text-white text-xs font-bold transition-all flex items-center justify-center"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </>
              ) : (
                <div className="text-center py-16 text-gray-400 text-xs">
                  Select a study group to open discussion room.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal: Create Study Group */}
      {showCreateGroupModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#12151e] border border-[#262c3b] rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white">Create New Study Group</h3>
              <button
                onClick={() => setShowCreateGroupModal(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Group Name</label>
                <input
                  type="text"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  placeholder="e.g. JEE 2025 Physics Titans"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#171b26] border border-[#293245] text-white text-xs focus:outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Subject / Category</label>
                <select
                  value={newGroupCategory}
                  onChange={(e) => setNewGroupCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#171b26] border border-[#293245] text-white text-xs focus:outline-none focus:border-orange-500"
                >
                  <option value="Physics">Physics</option>
                  <option value="Chemistry">Chemistry</option>
                  <option value="Mathematics">Mathematics</option>
                  <option value="Biology">Biology</option>
                  <option value="Computer Science">Computer Science</option>
                  <option value="General Prep">General Prep</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Group Goal / Description</label>
                <textarea
                  value={newGroupDesc}
                  onChange={(e) => setNewGroupDesc(e.target.value)}
                  rows={3}
                  placeholder="What will students discuss or solve here?"
                  className="w-full px-3.5 py-2 rounded-xl bg-[#171b26] border border-[#293245] text-white text-xs focus:outline-none focus:border-orange-500"
                />
              </div>
            </div>

            <div className="flex gap-2.5 pt-2">
              <button
                onClick={() => setShowCreateGroupModal(false)}
                className="flex-1 py-2.5 rounded-xl bg-[#181d28] text-gray-300 text-xs font-semibold hover:bg-[#202736]"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateGroup}
                className="flex-1 py-2.5 rounded-xl bg-orange-500 text-white text-xs font-bold hover:bg-orange-600 shadow-md shadow-orange-500/20"
              >
                Create Group
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
