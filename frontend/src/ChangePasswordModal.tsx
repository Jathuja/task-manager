import React, { useState } from 'react';
import { 
  Dialog, DialogTitle, DialogContent, DialogActions, 
  Button, TextField, Box, Typography, IconButton, InputAdornment
} from '@mui/material';
import { Close, Visibility, VisibilityOff, Save } from '@mui/icons-material';
import axios from 'axios';

const API_URL = "http://127.0.0.1:8000";

export default function ChangePasswordModal({ open, onClose }) {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleUpdate = async () => {
    if (!oldPassword || !newPassword) {
      setErrorMsg("Both Old and New Password are required.");
      return;
    }
    
    setLoading(true);
    setSuccessMsg('');
    setErrorMsg('');
    
    try {
      const updateData = {
        old_password: oldPassword,
        password: newPassword
      };

      await axios.put(`${API_URL}/users/update`, updateData, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      setSuccessMsg("Password changed successfully!");
      setOldPassword('');
      setNewPassword('');
      
      setTimeout(() => {
        setSuccessMsg('');
        onClose();
      }, 2000);
      
    } catch (err) {
      setErrorMsg(err.response?.data?.detail || "Failed to update password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: '24px', p: 1 } }}>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
        <Typography variant="h5" fontWeight="800" color="#111827">Change Password</Typography>
        <IconButton onClick={onClose} size="small" sx={{ color: '#9CA3AF' }}>
          <Close />
        </IconButton>
      </DialogTitle>
      
      <DialogContent>
        <Typography variant="body2" color="#6B7280" mb={3}>
          Please enter your old password to set a new password.
        </Typography>

        {successMsg && (
          <Box p={2} mb={3} bgcolor="#D1FAE5" color="#065F46" borderRadius="12px">
            <Typography variant="body2" fontWeight="600">{successMsg}</Typography>
          </Box>
        )}

        {errorMsg && (
          <Box p={2} mb={3} bgcolor="#FEE2E2" color="#991B1B" borderRadius="12px">
            <Typography variant="body2" fontWeight="600">{errorMsg}</Typography>
          </Box>
        )}

        <Box display="flex" flexDirection="column" gap={3}>
          <TextField
            label="Old Password"
            type={showOldPassword ? 'text' : 'password'}
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            fullWidth
            InputProps={{
              sx: { borderRadius: '12px', bgcolor: '#F9FAFB', '& fieldset': { borderColor: '#E5E7EB' } },
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowOldPassword(!showOldPassword)} edge="end" sx={{ color: '#9CA3AF' }}>
                    {showOldPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              )
            }}
          />
          
          <TextField
            label="New Password"
            type={showNewPassword ? 'text' : 'password'}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            fullWidth
            InputProps={{
              sx: { borderRadius: '12px', bgcolor: '#F9FAFB', '& fieldset': { borderColor: '#E5E7EB' } },
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowNewPassword(!showNewPassword)} edge="end" sx={{ color: '#9CA3AF' }}>
                    {showNewPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              )
            }}
          />
        </Box>
      </DialogContent>
      
      <DialogActions sx={{ px: 3, pb: 3, pt: 1 }}>
        <Button onClick={onClose} sx={{ color: '#6B7280', fontWeight: 600, textTransform: 'none' }}>
          Cancel
        </Button>
        <Button 
          variant="contained" 
          onClick={handleUpdate} 
          disabled={loading}
          startIcon={<Save />}
          sx={{ 
            bgcolor: '#6366F1', 
            borderRadius: '12px', 
            px: 3,
            '&:hover': { bgcolor: '#4F46E5' },
            textTransform: 'none',
            fontWeight: 600,
          }}
        >
          {loading ? 'Saving...' : 'Save Password'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
