import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Button,
  Chip,
  Dialog,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Visibility as ViewIcon,
  History as HistoryIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { Contract, ContractStatus } from '../../types/contract';
import { contractsApi } from '../../services/api/contracts';
import ContractForm from './ContractForm';
import ContractDetails from './ContractDetails';
import ContractHistory from './ContractHistory';
import { useSnackbar } from 'notistack';

const statusColors: Record<ContractStatus, 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'> = {
  [ContractStatus.DRAFT]: 'default',
  [ContractStatus.PENDING_APPROVAL]: 'info',
  [ContractStatus.APPROVED]: 'secondary',
  [ContractStatus.ACTIVE]: 'success',
  [ContractStatus.ON_HOLD]: 'warning',
  [ContractStatus.TERMINATED]: 'error',
  [ContractStatus.EXPIRED]: 'error',
};

const ContractManagement: React.FC = () => {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    loadContracts();
  }, []);

  const loadContracts = async () => {
    try {
      const response = await contractsApi.getContracts();
      setContracts(response.data);
    } catch (error) {
      enqueueSnackbar('Error al cargar los contratos', { variant: 'error' });
    }
  };

  const handleCreateClick = () => {
    setSelectedContract(null);
    setIsEditing(false);
    setIsFormOpen(true);
  };

  const handleEditClick = (contract: Contract) => {
    setSelectedContract(contract);
    setIsEditing(true);
    setIsFormOpen(true);
  };

  const handleViewClick = (contract: Contract) => {
    setSelectedContract(contract);
    setIsViewOpen(true);
  };

  const handleHistoryClick = (contract: Contract) => {
    setSelectedContract(contract);
    setIsHistoryOpen(true);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setSelectedContract(null);
    setIsEditing(false);
  };

  const handleFormSubmit = async () => {
    await loadContracts();
    handleFormClose();
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
          <Typography variant="h4" component="h1">
            Gestión de Contratos
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleCreateClick}
          >
            Nuevo Contrato
          </Button>
        </Box>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Número</TableCell>
                <TableCell>Título</TableCell>
                <TableCell>Parte</TableCell>
                <TableCell>Valor</TableCell>
                <TableCell>Fecha Inicio</TableCell>
                <TableCell>Fecha Fin</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell align="right">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {contracts.map((contract) => (
                <TableRow key={contract.id}>
                  <TableCell>{contract.contractNumber}</TableCell>
                  <TableCell>{contract.title}</TableCell>
                  <TableCell>{contract.partyName}</TableCell>
                  <TableCell>
                    {new Intl.NumberFormat('es-ES', {
                      style: 'currency',
                      currency: contract.currency,
                    }).format(contract.value)}
                  </TableCell>
                  <TableCell>
                    {format(new Date(contract.startDate), 'dd/MM/yyyy')}
                  </TableCell>
                  <TableCell>
                    {format(new Date(contract.endDate), 'dd/MM/yyyy')}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={contract.status}
                      color={statusColors[contract.status]}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      onClick={() => handleViewClick(contract)}
                      title="Ver detalles"
                    >
                      <ViewIcon />
                    </IconButton>
                    {contract.status === ContractStatus.DRAFT && (
                      <IconButton
                        size="small"
                        onClick={() => handleEditClick(contract)}
                        title="Editar"
                      >
                        <EditIcon />
                      </IconButton>
                    )}
                    <IconButton
                      size="small"
                      onClick={() => handleHistoryClick(contract)}
                      title="Ver historial"
                    >
                      <HistoryIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Dialog
          open={isFormOpen}
          onClose={handleFormClose}
          maxWidth="md"
          fullWidth
        >
          <ContractForm
            contract={selectedContract}
            isEditing={isEditing}
            onSubmit={handleFormSubmit}
            onCancel={handleFormClose}
          />
        </Dialog>

        <Dialog
          open={isViewOpen}
          onClose={() => setIsViewOpen(false)}
          maxWidth="md"
          fullWidth
        >
          {selectedContract && (
            <ContractDetails
              contract={selectedContract}
              onClose={() => setIsViewOpen(false)}
              onStatusChange={loadContracts}
            />
          )}
        </Dialog>

        <Dialog
          open={isHistoryOpen}
          onClose={() => setIsHistoryOpen(false)}
          maxWidth="md"
          fullWidth
        >
          {selectedContract && (
            <ContractHistory
              contractId={selectedContract.id}
              onClose={() => setIsHistoryOpen(false)}
            />
          )}
        </Dialog>
      </Box>
    </Container>
  );
};

export default ContractManagement;