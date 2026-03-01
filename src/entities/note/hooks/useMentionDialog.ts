import { useState, useCallback, useEffect } from 'react';
import { notesService } from '../api/notesService';
import { showToast } from '@/lib/utils/toast';

interface User {
  id: string;
  name: string;
  email: string;
  username?: string;
  avatar?: string;
  position?: string;
  role?: string;
  isOnline?: boolean;
}

interface UseMentionDialogProps {
  noteId?: string;
  productId?: number;
  onMentionAdded?: () => void;
  prefetchOnMount?: boolean;
}

export function useMentionDialog({ 
  noteId, 
  productId, 
  onMentionAdded,
  prefetchOnMount = true
}: UseMentionDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [isAddingMentions, setIsAddingMentions] = useState(false);
  const [hasLoadedUsers, setHasLoadedUsers] = useState(false);

  useEffect(() => {
    if (searchQuery.trim().length === 0) {
      setFilteredUsers(users);
      return;
    }

    const filtered = users.filter(user => 
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (user.username && user.username.toLowerCase().includes(searchQuery.toLowerCase()))
    );
    setFilteredUsers(filtered);
  }, [searchQuery, users]);

  const searchUsers = useCallback(async (query: string) => {
    try {
      setIsLoadingUsers(true);
      const response = await notesService.searchUsersForMention({
        q: query,
        productId,
        limit: 20
      });

      if (response.success) {
        setUsers(response.users);
        setHasLoadedUsers(true);
      } else {
        console.error('Failed to search users:', response);
      }
    } catch (error) {
      console.error('Error searching users:', error);
      showToast.error('Failed to search users');
    } finally {
      setIsLoadingUsers(false);
    }
  }, [productId]);

  const getAllUsers = useCallback(async () => {
    try {
      setIsLoadingUsers(true);
      const response = await notesService.searchUsersForMention({
        productId,
        limit: 50
      });

      if (response.success) {
        setUsers(response.users);
        setHasLoadedUsers(true);
      } else {
        console.error('Failed to get users:', response);
      }
    } catch (error) {
      console.error('Error getting users:', error);
      showToast.error('Failed to get users');
    } finally {
      setIsLoadingUsers(false);
    }
  }, [productId]);

  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const toggleUserSelection = useCallback((user: User) => {
    setSelectedUsers(prev => {
      const isSelected = prev.some(u => u.id === user.id);
      if (isSelected) {
        return prev.filter(u => u.id !== user.id);
      } else {
        return [...prev, user];
      }
    });
  }, []);

  const addMentions = useCallback(async () => {
    if (!noteId || selectedUsers.length === 0) {
      showToast.error('Please select users to mention');
      return;
    }

    try {
      setIsAddingMentions(true);
      const mentions = selectedUsers.map(user => ({
        userId: user.id,
        username: user.username || user.name,
        name: user.name,
        email: user.email
      }));

      const response = await notesService.addMentions(noteId, { mentions });

      if (response.success) {
        showToast.success('Mentions added successfully!');
        setSelectedUsers([]);
        setIsOpen(false);
        onMentionAdded?.();
      } else {
        showToast.error(response.message || 'Failed to add mentions');
      }
    } catch (error: any) {
      console.error('Error adding mentions:', error);
      showToast.error(error.response?.data?.error || 'Failed to add mentions');
    } finally {
      setIsAddingMentions(false);
    }
  }, [noteId, selectedUsers, onMentionAdded]);

  const openDialog = useCallback(async () => {
    setIsOpen(true);
    setSearchQuery('');
    setSelectedUsers([]);
    setFilteredUsers(users);

    if ((!hasLoadedUsers || users.length === 0) && !isLoadingUsers) {
    setFilteredUsers([]);
    await getAllUsers();
    }
  }, [getAllUsers, hasLoadedUsers, users, isLoadingUsers]);

  const closeDialog = useCallback(() => {
    setIsOpen(false);
    setSearchQuery('');
    setSelectedUsers([]);
    setFilteredUsers(users);
  }, [users]);

  useEffect(() => {
    if (prefetchOnMount && !hasLoadedUsers) {
      getAllUsers();
    }
  }, [prefetchOnMount, hasLoadedUsers, getAllUsers]);

  return {
    isOpen,
    searchQuery,
    filteredUsers,
    selectedUsers,
    isLoadingUsers,
    isAddingMentions,
    openDialog,
    closeDialog,
    handleSearchChange,
    toggleUserSelection,
    addMentions
  };
}
