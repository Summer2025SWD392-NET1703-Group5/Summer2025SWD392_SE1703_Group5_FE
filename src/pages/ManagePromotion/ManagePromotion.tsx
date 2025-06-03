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
import api from '../../config/axios';
import type { SelectChangeEvent } from '@mui/material/Select';

const styles = {
  pageContainer: {
    padding: 4,
    backgroundColor: '#f5f5f5',
    minHeight: '100vh',
  },
  mainPaper: {
    padding: 3,
    borderRadius: 2,
    backgroundColor: '#ffffff',
  },
  pageTitle: {
    fontWeight: 700,
    color: '#1a237e',
    marginBottom: 3,
    borderBottom: '2px solid #1a237e',
    paddingBottom: 1,
    fontSize: '2.2rem',
  },
  addButton: {
    backgroundColor: '#1a237e',
    '&:hover': {
      backgroundColor: '#000051',
    },
    padding: '12px 28px',
    fontWeight: 600,
    fontSize: '1.1rem',
  },
  tableContainer: {
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    borderRadius: 1,
    overflow: 'hidden',
    minHeight: '400px',
    position: 'relative',
  },
  loadingOverlay: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    zIndex: 1,
  },
  tableHeader: {
    backgroundColor: '#e8eaf6',
  },
  headerCell: {
    fontWeight: 700,
    color: '#1a237e',
    fontSize: '1.15rem',
    padding: '16px 8px',
  },
  tableRow: {
    '&:hover': {
      backgroundColor: '#f5f5f5',
      transition: 'background-color 0.3s',
    },
  },
  tableCell: {
    fontSize: '1.1rem',
    padding: '20px 8px',
  },
  statusTag: {
    padding: '6px 12px',
    borderRadius: 2,
    display: 'inline-block',
    fontSize: '1.05rem',
    fontWeight: 500,
  },
  editButton: {
    borderColor: '#1a237e',
    color: '#1a237e',
    '&:hover': {
      borderColor: '#000051',
      backgroundColor: '#e8eaf6',
    },
    fontSize: '1rem',
    padding: '6px 16px',
  },
  deleteButton: {
    borderColor: '#d32f2f',
    color: '#d32f2f',
    '&:hover': {
      borderColor: '#b71c1c',
      backgroundColor: '#ffebee',
    },
    fontSize: '1rem',
    padding: '6px 16px',
  },
  pagination: {
    mt: 4,
    display: 'flex',
    justifyContent: 'center',
    '& .MuiPaginationItem-root': {
      color: '#1a237e',
      fontSize: '1.1rem',
    },
    '& .Mui-selected': {
      backgroundColor: '#1a237e !important',
      color: '#ffffff',
    },
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
      <Paper elevation={3} sx={styles.mainPaper}>
        <Typography variant="h4" gutterBottom sx={styles.pageTitle}>
          QUẢN LÝ MÃ KHUYẾN MÃI
        </Typography>
        <Box sx={{ mt: 3, mb: 3, display: 'flex', justifyContent: 'flex-end' }}>
          <Button variant="contained" sx={styles.addButton} onClick={handleOpenAddDialog}>
            Thêm Mã Khuyến Mãi
          </Button>
        </Box>
        <TableContainer component={Paper} sx={styles.tableContainer}>
          {loading && (
            <Box sx={styles.loadingOverlay}>
              <CircularProgress />
            </Box>
          )}
          <Table>
            <TableHead>
              <TableRow sx={styles.tableHeader}>
                <TableCell sx={styles.headerCell}>ID</TableCell>
                <TableCell sx={styles.headerCell}>Tiêu Đề</TableCell>
                <TableCell sx={styles.headerCell}>Mã Code</TableCell>
                <TableCell sx={styles.headerCell}>Ngày Bắt Đầu</TableCell>
                <TableCell sx={styles.headerCell}>Ngày Kết Thúc</TableCell>
                <TableCell sx={styles.headerCell}>Loại Giảm Giá</TableCell>
                <TableCell sx={styles.headerCell}>Giá Trị</TableCell>
                <TableCell sx={styles.headerCell}>Trạng Thái</TableCell>
                <TableCell sx={styles.headerCell}>Thao Tác</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedPromotions.map((promotion) => (
                <TableRow key={promotion.Promotion_ID} sx={styles.tableRow}>
                  <TableCell sx={styles.tableCell}>{promotion.Promotion_ID}</TableCell>
                  <TableCell sx={styles.tableCell}>{promotion.Title}</TableCell>
                  <TableCell sx={styles.tableCell}>{promotion.Promotion_Code}</TableCell>
                  <TableCell sx={styles.tableCell}>{new Date(promotion.Start_Date).toLocaleDateString('vi-VN')}</TableCell>
                  <TableCell sx={styles.tableCell}>{new Date(promotion.End_Date).toLocaleDateString('vi-VN')}</TableCell>
                  <TableCell sx={styles.tableCell}>{promotion.Discount_Type}</TableCell>
                  <TableCell sx={styles.tableCell}>{promotion.Discount_Value}</TableCell>
                  <TableCell sx={styles.tableCell}>
                    <Box sx={{ ...styles.statusTag, backgroundColor: promotion.Status === 'Active' ? '#e8f5e9' : '#ffebee', color: promotion.Status === 'Active' ? '#1b5e20' : '#d32f2f' }}>
                      {promotion.Status === 'Active' ? 'Đang hoạt động' : 'Ngừng hoạt động'}
                    </Box>
                  </TableCell>
                  <TableCell sx={styles.tableCell}>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button variant="outlined" size="medium" sx={styles.editButton} onClick={() => handleOpenEditDialog(promotion)}>
                        Sửa
                      </Button>
                      <Button
                        variant="outlined"
                        size="medium"
                        sx={styles.deleteButton}
                        onClick={() => handleOpenDeleteDialog(promotion)}
                      >
                        Xóa
                      </Button>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <Box sx={styles.pagination}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={handlePageChange}
            color="primary"
          />
        </Box>
      </Paper>
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
