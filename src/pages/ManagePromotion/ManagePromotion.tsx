import React, { useEffect, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Box,
  Typography,
  Pagination,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  TextField,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  RadioGroup,
  FormControlLabel,
  Radio,
} from '@mui/material';
import type { Theme } from '@mui/material/styles';
import type { SxProps } from '@mui/system';
import api from '../../config/axios';
import type { SelectChangeEvent } from '@mui/material/Select';
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiX, FiAlertCircle, FiRefreshCw, FiAlertTriangle, FiGrid, FiLayout, FiInfo } from 'react-icons/fi';

const styles = {
  pageContainer: {
    padding: '24px',
    backgroundColor: '#f9fafb',
    minHeight: '100vh',
  },
  pageHeader: {
    display: 'flex',
    flexDirection: { xs: 'column', md: 'row' },
    justifyContent: 'space-between',
    alignItems: { xs: 'flex-start', md: 'center' },
    marginBottom: '32px',
  },
  pageTitle: {
    marginBottom: '8px',
    fontSize: '28px',
    fontWeight: 700,
    color: '#111827',
  },
  pageSubtitle: {
    color: '#6b7280',
    fontSize: '16px',
  },
  addButton: {
    marginTop: { xs: '16px', md: 0 },
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 20px',
    backgroundColor: '#3b82f6',
    color: '#ffffff',
    fontWeight: 500,
    fontSize: '16px',
    border: 'none',
    borderRadius: '8px',
    transition: 'background-color 0.3s, box-shadow 0.3s',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    '&:hover': {
      backgroundColor: '#2563eb',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.15)',
    },
  },
  filtersContainer: {
    backgroundColor: '#ffffff',
    borderRadius: '10px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
    padding: '16px',
    marginBottom: '24px',
    border: '1px solid #e5e7eb',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '16px',
    flexWrap: 'wrap',
  },
  searchContainer: {
    flex: '1',
    minWidth: '250px',
    maxWidth: '350px',
    position: 'relative',
  },
  searchInput: {
    width: '100%',
    padding: '10px 40px',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    fontSize: '15px',
    backgroundColor: '#f9fafb',
    transition: 'border-color 0.3s, box-shadow 0.3s',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
    '&:focus': {
      borderColor: '#3b82f6',
      boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)',
      outline: 'none',
      backgroundColor: '#ffffff',
    },
  },
  searchIcon: {
    position: 'absolute',
    left: '12px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#9ca3af',
  },
  clearSearchButton: {
    position: 'absolute',
    right: '12px',
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'none',
    border: 'none',
    color: '#9ca3af',
    cursor: 'pointer',
    transition: 'color 0.3s',
    '&:hover': {
      color: '#4b5563',
    },
  },
  tableContainer: {
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    overflow: 'hidden',
  },
  tableHeader: {
    backgroundColor: '#f3f4f6',
  },
  tableHeaderCell: {
    padding: '12px 24px',
    textAlign: 'left',
    fontSize: '12px',
    fontWeight: 500,
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    borderBottom: '1px solid #e5e7eb',
  },
  tableRow: {
    '&:hover': {
      backgroundColor: '#f9fafb',
    },
  },
  tableCell: {
    padding: '16px 24px',
    borderBottom: '1px solid #e5e7eb',
    fontSize: '14px',
  },
  cellContent: {
    color: '#6b7280',
  },
  cellContentBold: {
    fontWeight: 500,
    color: '#1f2937',
  },
  statusLabel: {
    padding: '4px 8px',
    fontSize: '12px',
    fontWeight: 500,
    borderRadius: '9999px',
  },
  statusActive: {
    backgroundColor: '#dcfce7',
    color: '#15803d',
  },
  statusInactive: {
    backgroundColor: '#f3f4f6',
    color: '#4b5563',
  },
  actionButtons: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '8px',
  },
  editButton: {
    padding: '4px',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#2563eb',
    '&:hover': {
      color: '#1d4ed8',
    },
  },
  deleteButton: {
    padding: '4px',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#ef4444',
    '&:hover': {
      color: '#dc2626',
    },
  },
  actionIcon: {
    width: '20px',
    height: '20px',
  },
  loadingContainer: {
    textAlign: 'center',
    padding: '48px 0',
  },
  loadingSpinner: {
    color: '#3b82f6',
  },
  loadingText: {
    color: '#6b7280',
    marginTop: '16px',
  },
  noDataMessage: {
    textAlign: 'center',
    padding: '48px 0',
  },
  noDataIcon: {
    width: '48px',
    height: '48px',
    color: '#9ca3af',
    margin: '0 auto 16px',
  },
  noDataTitle: {
    fontSize: '18px',
    fontWeight: 500,
    color: '#1f2937',
    marginBottom: '4px',
  },
  noDataText: {
    color: '#6b7280',
  },
  pagination: {
    display: 'flex',
    justifyContent: 'center',
    padding: '24px',
  },
};

interface Promotion {
  Promotion_ID: number;
  Title: string;
  Promotion_Code: string;
  Start_Date: string;
  End_Date: string;
  Discount_Type: string;
  Discount_Value: number;
  Status: string;
  Is_Active: boolean;
}

const PAGE_SIZE = 10;

const ManagePromotion = () => {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' as 'success' | 'error' | 'info' | 'warning' });
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [promotionToDelete, setPromotionToDelete] = useState<Promotion | null>(null);
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [newPromotion, setNewPromotion] = useState({
    Title: '',
    Promotion_Code: '',
    Start_Date: '',
    End_Date: '',
    Discount_Type: 'Percentage',
    Discount_Value: 0,
    Minimum_Purchase: 100000,
    Maximum_Discount: 200000,
    Applicable_For: 'All Users',
    Usage_Limit: 100,
    Status: 'Active',
    Promotion_Detail: '',
  });
  const [editPromotion, setEditPromotion] = useState<Promotion | null>(null);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [editForm, setEditForm] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchPromotions = async () => {
    setLoading(true);
    try {
      const response = await api.get('/promotions');
      setPromotions(response.data);
      setTotalPages(Math.ceil(response.data.length / PAGE_SIZE));
    } catch (error) {
      setSnackbar({ open: true, message: 'Lỗi khi tải danh sách khuyến mãi', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPromotions();
  }, []);

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  const handleOpenDeleteDialog = (promotion: Promotion) => {
    setPromotionToDelete(promotion);
    setOpenDeleteDialog(true);
  };

  const handleCloseDeleteDialog = () => {
    setPromotionToDelete(null);
    setOpenDeleteDialog(false);
  };

  const handleDeletePromotion = async () => {
    if (!promotionToDelete) return;
    setLoading(true);
    try {
      const res = await api.delete(`/promotions/${promotionToDelete.Promotion_ID}`);
      setSnackbar({ open: true, message: res.data?.message || 'Xóa mã khuyến mãi thành công!', severity: 'success' });
      fetchPromotions();
    } catch (error) {
      setSnackbar({ open: true, message: 'Lỗi khi xóa mã khuyến mãi', severity: 'error' });
    } finally {
      setLoading(false);
      handleCloseDeleteDialog();
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const getStatusColor = (active: boolean) => {
    return active
      ? { bg: '#e8f5e9', color: '#1b5e20' }
      : { bg: '#ffebee', color: '#d32f2f' };
  };

  // Pagination
  const paginatedPromotions = promotions.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleOpenAddDialog = () => setOpenAddDialog(true);
  const handleCloseAddDialog = () => {
    setOpenAddDialog(false);
    setNewPromotion({
      Title: '',
      Promotion_Code: '',
      Start_Date: '',
      End_Date: '',
      Discount_Type: 'Percentage',
      Discount_Value: 0,
      Minimum_Purchase: 100000,
      Maximum_Discount: 200000,
      Applicable_For: 'All Users',
      Usage_Limit: 100,
      Status: 'Active',
      Promotion_Detail: '',
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewPromotion((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (e: SelectChangeEvent) => {
    const { name, value } = e.target;
    if (name === 'Discount_Type') {
      if (value === 'Fix') {
        setNewPromotion((prev) => ({
          ...prev,
          Discount_Type: 'Fix',
          Minimum_Purchase: 100000,
          Maximum_Discount: 100000,
        }));
      } else {
        setNewPromotion((prev) => ({
          ...prev,
          Discount_Type: 'Percentage',
          Minimum_Purchase: 100000,
          Maximum_Discount: 200000,
        }));
      }
    } else {
      setNewPromotion((prev) => ({ ...prev, [name as string]: value }));
    }
  };

  const handleAddPromotion = async () => {
    setLoading(true);
    try {
      await api.post('/promotions', newPromotion);
      setSnackbar({ open: true, message: 'Thêm mã khuyến mãi thành công!', severity: 'success' });
      fetchPromotions();
      handleCloseAddDialog();
    } catch (error) {
      setSnackbar({ open: true, message: 'Lỗi khi thêm mã khuyến mãi', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenEditDialog = (promotion: Promotion) => {
    setEditPromotion(promotion);
    setEditForm({ ...promotion });
    setOpenEditDialog(true);
  };
  const handleCloseEditDialog = () => {
    setOpenEditDialog(false);
    setEditPromotion(null);
    setEditForm(null);
  };
  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditForm((prev: any) => ({ ...prev, [name]: value }));
  };
  const handleEditSelectChange = (e: SelectChangeEvent) => {
    const { name, value } = e.target;
    if (name === 'Discount_Type') {
      if (value === 'Fix') {
        setEditForm((prev: any) => ({
          ...prev,
          Discount_Type: 'Fix',
          Minimum_Purchase: 100000,
          Maximum_Discount: 100000,
        }));
      } else {
        setEditForm((prev: any) => ({
          ...prev,
          Discount_Type: 'Percentage',
          Minimum_Purchase: 100000,
          Maximum_Discount: 200000,
        }));
      }
    } else {
      setEditForm((prev: any) => ({ ...prev, [name as string]: value }));
    }
  };
  const handleUpdatePromotion = async () => {
    if (!editPromotion) return;
    setLoading(true);
    try {
      await api.put(`/promotions/${editPromotion.Promotion_ID}`, editForm);
      setSnackbar({ open: true, message: 'Cập nhật mã khuyến mãi thành công!', severity: 'success' });
      fetchPromotions();
      handleCloseEditDialog();
    } catch (error) {
      setSnackbar({ open: true, message: 'Lỗi khi cập nhật mã khuyến mãi', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={styles.pageContainer}>
      {/* Page Header */}
      <Box sx={styles.pageHeader}>
        <Box>
          <Typography variant="h4" sx={styles.pageTitle}>
            QUẢN LÝ MÃ KHUYẾN MÃI
          </Typography>
          <Typography sx={styles.pageSubtitle}>
            Quản lý các mã khuyến mãi và thông tin chi tiết của chúng
          </Typography>
        </Box>
        <Button
          variant="contained"
          onClick={handleOpenAddDialog}
          sx={styles.addButton}
          startIcon={<FiPlus />}
        >
          Thêm Mã Khuyến Mãi
        </Button>
      </Box>

      {/* Filters and Controls */}
      <Box sx={styles.filtersContainer}>
        <Box sx={styles.searchContainer}>
          <TextField
            fullWidth
            placeholder="Tìm kiếm mã khuyến mãi..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={styles.searchInput}
            InputProps={{
              startAdornment: <FiSearch style={styles.actionIcon} />,
              endAdornment: searchTerm && (
                <FiX
                  style={styles.actionIcon}
                  onClick={() => setSearchTerm('')}
                />
              ),
            }}
          />
        </Box>
      </Box>

      {/* Table Container */}
      <TableContainer component={Paper} sx={styles.tableContainer}>
        {loading ? (
          <Box sx={styles.loadingContainer}>
            <CircularProgress sx={styles.loadingSpinner} />
            <Typography sx={styles.loadingText}>Đang tải danh sách mã khuyến mãi...</Typography>
          </Box>
        ) : (
          <>
            {paginatedPromotions.length > 0 ? (
              <Table>
                <TableHead sx={styles.tableHeader}>
                  <TableRow>
                    <TableCell sx={styles.tableHeaderCell}>ID</TableCell>
                    <TableCell sx={styles.tableHeaderCell}>Tiêu Đề</TableCell>
                    <TableCell sx={styles.tableHeaderCell}>Mã Code</TableCell>
                    <TableCell sx={styles.tableHeaderCell}>Ngày Bắt Đầu</TableCell>
                    <TableCell sx={styles.tableHeaderCell}>Ngày Kết Thúc</TableCell>
                    <TableCell sx={styles.tableHeaderCell}>Loại Giảm Giá</TableCell>
                    <TableCell sx={styles.tableHeaderCell}>Giá Trị</TableCell>
                    <TableCell sx={styles.tableHeaderCell}>Trạng Thái</TableCell>
                    <TableCell sx={styles.tableHeaderCell}>Thao Tác</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedPromotions.map((promotion) => (
                    <TableRow key={promotion.Promotion_ID} sx={styles.tableRow}>
                      <TableCell sx={styles.tableCell}>
                        <Box sx={styles.cellContentBold}>{promotion.Promotion_ID}</Box>
                      </TableCell>
                      <TableCell sx={styles.tableCell}>
                        <Box sx={styles.cellContentBold}>{promotion.Title}</Box>
                      </TableCell>
                      <TableCell sx={styles.tableCell}>
                        <Box sx={styles.cellContent}>{promotion.Promotion_Code}</Box>
                      </TableCell>
                      <TableCell sx={styles.tableCell}>
                        <Box sx={styles.cellContent}>
                          {new Date(promotion.Start_Date).toLocaleDateString('vi-VN')}
                        </Box>
                      </TableCell>
                      <TableCell sx={styles.tableCell}>
                        <Box sx={styles.cellContent}>
                          {new Date(promotion.End_Date).toLocaleDateString('vi-VN')}
                        </Box>
                      </TableCell>
                      <TableCell sx={styles.tableCell}>
                        <Box sx={styles.cellContent}>{promotion.Discount_Type}</Box>
                      </TableCell>
                      <TableCell sx={styles.tableCell}>
                        <Box sx={styles.cellContent}>{promotion.Discount_Value}</Box>
                      </TableCell>
                      <TableCell sx={styles.tableCell}>
                        <Box
                          sx={{
                            ...styles.statusLabel,
                            ...(promotion.Status === 'Active'
                              ? styles.statusActive
                              : styles.statusInactive),
                          }}
                        >
                          {promotion.Status === 'Active' ? 'Đang hoạt động' : 'Ngừng hoạt động'}
                        </Box>
                      </TableCell>
                      <TableCell sx={styles.tableCell}>
                        <Box sx={styles.actionButtons}>
                          <Button
                            onClick={() => handleOpenEditDialog(promotion)}
                            sx={styles.editButton}
                            title="Chỉnh Sửa"
                          >
                            <FiEdit2 style={styles.actionIcon} />
                          </Button>
                          <Button
                            onClick={() => handleOpenDeleteDialog(promotion)}
                            sx={styles.deleteButton}
                            title="Xóa"
                          >
                            <FiTrash2 style={styles.actionIcon} />
                          </Button>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <Box sx={styles.noDataMessage}>
                <FiInfo style={styles.actionIcon} />
                <Typography sx={styles.noDataTitle}>Không tìm thấy mã khuyến mãi</Typography>
                <Typography sx={styles.noDataText}>
                  {searchTerm
                    ? 'Thử điều chỉnh tiêu chí tìm kiếm của bạn'
                    : 'Thêm một mã khuyến mãi mới để bắt đầu'}
                </Typography>
              </Box>
            )}
          </>
        )}
      </TableContainer>

      {/* Pagination */}
      {paginatedPromotions.length > 0 && (
        <Box sx={styles.pagination}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={handlePageChange}
            color="primary"
          />
        </Box>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={openDeleteDialog}
        onClose={handleCloseDeleteDialog}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title">Xác nhận xóa mã khuyến mãi</DialogTitle>
        <DialogContent>
          <Typography id="delete-dialog-description">
            Bạn có chắc chắn muốn xóa mã khuyến mãi "{promotionToDelete?.Title}"? Hành động này không thể hoàn tác.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog} color="primary">
            Hủy
          </Button>
          <Button
            onClick={handleDeletePromotion}
            color="error"
            variant="contained"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Xóa'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Promotion Dialog */}
      <Dialog open={openAddDialog} onClose={handleCloseAddDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Thêm Mã Khuyến Mãi</DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField label="Tiêu đề" name="Title" value={newPromotion.Title} onChange={handleChange} fullWidth required />
            <TextField label="Mã Code" name="Promotion_Code" value={newPromotion.Promotion_Code} onChange={handleChange} fullWidth required />
            <TextField label="Ngày bắt đầu" name="Start_Date" type="date" value={newPromotion.Start_Date} onChange={handleChange} InputLabelProps={{ shrink: true }} fullWidth required />
            <TextField label="Ngày kết thúc" name="End_Date" type="date" value={newPromotion.End_Date} onChange={handleChange} InputLabelProps={{ shrink: true }} fullWidth required />
            <FormControl fullWidth>
              <InputLabel id="discount-type-label">Loại giảm giá</InputLabel>
              <Select
                labelId="discount-type-label"
                name="Discount_Type"
                value={newPromotion.Discount_Type}
                label="Loại giảm giá"
                onChange={(e) => handleSelectChange(e as SelectChangeEvent)}
              >
                <MenuItem value="Percentage">Phần trăm (%)</MenuItem>
                <MenuItem value="Fix">Cố định (VNĐ)</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label={newPromotion.Discount_Type === 'Percentage' ? 'Giá trị giảm (%)' : 'Số tiền giảm (VNĐ)'}
              name="Discount_Value"
              type="number"
              value={newPromotion.Discount_Value}
              onChange={handleChange}
              fullWidth
              required
              inputProps={{ min: 0 }}
            />
            {newPromotion.Discount_Type === 'Percentage' && (
              <>
                <TextField
                  label="Giá trị đơn tối thiểu (VNĐ)"
                  name="Minimum_Purchase"
                  type="number"
                  value={newPromotion.Minimum_Purchase}
                  onChange={handleChange}
                  fullWidth
                  required
                  inputProps={{ min: 0 }}
                />
                <TextField
                  label="Giảm tối đa (VNĐ)"
                  name="Maximum_Discount"
                  type="number"
                  value={newPromotion.Maximum_Discount}
                  onChange={handleChange}
                  fullWidth
                  required
                  inputProps={{ min: 0 }}
                />
              </>
            )}
            {newPromotion.Discount_Type === 'Fix' && (
              <>
                <TextField
                  label="Giá trị đơn tối thiểu (VNĐ)"
                  name="Minimum_Purchase"
                  type="number"
                  value={100000}
                  disabled
                  fullWidth
                />
                <TextField
                  label="Giảm tối đa (VNĐ)"
                  name="Maximum_Discount"
                  type="number"
                  value={100000}
                  disabled
                  fullWidth
                />
              </>
            )}
            <FormControl fullWidth>
              <InputLabel id="status-label">Trạng thái</InputLabel>
              <Select
                labelId="status-label"
                name="Status"
                value={newPromotion.Status}
                label="Trạng thái"
                onChange={(e) => handleSelectChange(e as SelectChangeEvent)}
              >
                <MenuItem value="Active">Đang hoạt động</MenuItem>
                <MenuItem value="Inactive">Ngừng hoạt động</MenuItem>
              </Select>
            </FormControl>
            <TextField label="Chi tiết khuyến mãi" name="Promotion_Detail" value={newPromotion.Promotion_Detail} onChange={handleChange} fullWidth multiline minRows={2} />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAddDialog} color="primary">Hủy</Button>
          <Button onClick={handleAddPromotion} color="primary" variant="contained" disabled={loading}>
            {loading ? <CircularProgress size={24} /> : 'Thêm'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Promotion Dialog */}
      <Dialog open={openEditDialog} onClose={handleCloseEditDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Cập nhật Mã Khuyến Mãi</DialogTitle>
        <DialogContent dividers>
          {editForm && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField label="Tiêu đề" name="Title" value={editForm.Title} onChange={handleEditChange} fullWidth required />
              <TextField label="Mã Code" name="Promotion_Code" value={editForm.Promotion_Code} onChange={handleEditChange} fullWidth required />
              <TextField label="Ngày bắt đầu" name="Start_Date" type="date" value={editForm.Start_Date?.slice(0,10)} onChange={handleEditChange} InputLabelProps={{ shrink: true }} fullWidth required />
              <TextField label="Ngày kết thúc" name="End_Date" type="date" value={editForm.End_Date?.slice(0,10)} onChange={handleEditChange} InputLabelProps={{ shrink: true }} fullWidth required />
              <FormControl fullWidth>
                <InputLabel id="edit-discount-type-label">Loại giảm giá</InputLabel>
                <Select
                  labelId="edit-discount-type-label"
                  name="Discount_Type"
                  value={editForm.Discount_Type}
                  label="Loại giảm giá"
                  onChange={(e) => handleEditSelectChange(e as SelectChangeEvent)}
                >
                  <MenuItem value="Percentage">Phần trăm (%)</MenuItem>
                  <MenuItem value="Fix">Cố định (VNĐ)</MenuItem>
                </Select>
              </FormControl>
              <TextField
                label={editForm.Discount_Type === 'Percentage' ? 'Giá trị giảm (%)' : 'Số tiền giảm (VNĐ)'}
                name="Discount_Value"
                type="number"
                value={editForm.Discount_Value}
                onChange={handleEditChange}
                fullWidth
                required
                inputProps={{ min: 0 }}
              />
              {editForm.Discount_Type === 'Percentage' && (
                <>
                  <TextField
                    label="Giá trị đơn tối thiểu (VNĐ)"
                    name="Minimum_Purchase"
                    type="number"
                    value={editForm.Minimum_Purchase}
                    onChange={handleEditChange}
                    fullWidth
                    required
                    inputProps={{ min: 0 }}
                  />
                  <TextField
                    label="Giảm tối đa (VNĐ)"
                    name="Maximum_Discount"
                    type="number"
                    value={editForm.Maximum_Discount}
                    onChange={handleEditChange}
                    fullWidth
                    required
                    inputProps={{ min: 0 }}
                  />
                </>
              )}
              {editForm.Discount_Type === 'Fix' && (
                <>
                  <TextField
                    label="Giá trị đơn tối thiểu (VNĐ)"
                    name="Minimum_Purchase"
                    type="number"
                    value={100000}
                    disabled
                    fullWidth
                  />
                  <TextField
                    label="Giảm tối đa (VNĐ)"
                    name="Maximum_Discount"
                    type="number"
                    value={100000}
                    disabled
                    fullWidth
                  />
                </>
              )}
              <FormControl fullWidth>
                <InputLabel id="edit-status-label">Trạng thái</InputLabel>
                <Select
                  labelId="edit-status-label"
                  name="Status"
                  value={editForm.Status}
                  label="Trạng thái"
                  onChange={(e) => handleEditSelectChange(e as SelectChangeEvent)}
                >
                  <MenuItem value="Active">Đang hoạt động</MenuItem>
                  <MenuItem value="Inactive">Ngừng hoạt động</MenuItem>
                </Select>
              </FormControl>
              <TextField label="Chi tiết khuyến mãi" name="Promotion_Detail" value={editForm.Promotion_Detail} onChange={handleEditChange} fullWidth multiline minRows={2} />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEditDialog} color="primary">Hủy</Button>
          <Button onClick={handleUpdatePromotion} color="primary" variant="contained" disabled={loading}>
            {loading ? <CircularProgress size={24} /> : 'Cập nhật'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ManagePromotion;