import React from 'react';
import {
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Grid,
  Chip,
  Divider,
  Box,
} from '@mui/material';
import { format } from 'date-fns';
import { Contract, ContractStatus } from '../../types/contract';
import { contractsApi } from '../../services/api/contracts';
import { useSnackbar } from 'notistack';

interface ContractDetailsProps {
  contract: Contract;
  onClose: () => void;
  onStatusChange: () => void;
}

const ContractDetails: React.FC<ContractDetailsProps> = ({
  contract,
  onClose,
  onStatusChange,
}) => {
  const { enqueueSnackbar } = useSnackbar();

  const handleStatusChange = async (newStatus: ContractStatus) => {
    try {
      await contractsApi.changeStatus(contract.id, newStatus);
      enqueueSnackbar('Estado del contrato actualizado', { variant: 'success' });
      onStatusChange();
    } catch (error) {
      enqueueSnackbar('Error al cambiar el estado del contrato', {
        variant: 'error',
      });
    }
  };

  const renderStatusActions = () => {
    switch (contract.status) {
      case ContractStatus.DRAFT:
        return (
          <Button
            variant="contained"
            color="primary"
            onClick={() => handleStatusChange(ContractStatus.PENDING_APPROVAL)}
          >
            Enviar a Aprobación
          </Button>
        );
      case ContractStatus.PENDING_APPROVAL:
        return (
          <>
            <Button
              variant="contained"
              color="success"
              onClick={() => handleStatusChange(ContractStatus.APPROVED)}
            >
              Aprobar
            </Button>
            <Button
              variant="outlined"
              color="error"
              onClick={() => handleStatusChange(ContractStatus.DRAFT)}
            >
              Devolver a Borrador
            </Button>
          </>
        );
      case ContractStatus.APPROVED:
        return (
          <Button
            variant="contained"
            color="primary"
            onClick={() => handleStatusChange(ContractStatus.ACTIVE)}
          >
            Activar Contrato
          </Button>
        );
      case ContractStatus.ACTIVE:
        return (
          <>
            <Button
              variant="outlined"
              color="warning"
              onClick={() => handleStatusChange(ContractStatus.ON_HOLD)}
            >
              Poner en Espera
            </Button>
            <Button
              variant="outlined"
              color="error"
              onClick={() => handleStatusChange(ContractStatus.TERMINATED)}
            >
              Terminar Contrato
            </Button>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <DialogTitle>
        Detalles del Contrato
        <Typography variant="subtitle1" color="textSecondary">
          {contract.contractNumber}
        </Typography>
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Typography variant="h6">{contract.title}</Typography>
            <Chip
              label={contract.status}
              color={
                contract.status === ContractStatus.ACTIVE
                  ? 'success'
                  : 'default'
              }
              sx={{ mt: 1 }}
            />
          </Grid>

          <Grid item xs={12}>
            <Typography variant="body1">{contract.description}</Typography>
          </Grid>

          <Grid item xs={12}>
            <Divider />
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" color="textSecondary">
              Parte Contratante
            </Typography>
            <Typography variant="body1">{contract.partyName}</Typography>
            <Typography variant="body2">{contract.partyEmail}</Typography>
            {contract.partyPhone && (
              <Typography variant="body2">{contract.partyPhone}</Typography>
            )}
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" color="textSecondary">
              Valor del Contrato
            </Typography>
            <Typography variant="h6">
              {new Intl.NumberFormat('es-ES', {
                style: 'currency',
                currency: contract.currency,
              }).format(contract.value)}
            </Typography>
          </Grid>

          <Grid item xs={12}>
            <Divider />
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" color="textSecondary">
              Fecha de Inicio
            </Typography>
            <Typography variant="body1">
              {format(new Date(contract.startDate), 'dd/MM/yyyy')}
            </Typography>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" color="textSecondary">
              Fecha de Fin
            </Typography>
            <Typography variant="body1">
              {format(new Date(contract.endDate), 'dd/MM/yyyy')}
            </Typography>
          </Grid>

          {contract.renewalTerms && (
            <Grid item xs={12}>
              <Typography variant="subtitle2" color="textSecondary">
                Términos de Renovación
              </Typography>
              <Typography variant="body1">{contract.renewalTerms}</Typography>
              <Typography variant="body2" color="textSecondary">
                Renovación Automática:{' '}
                {contract.autoRenewal ? 'Habilitada' : 'Deshabilitada'}
              </Typography>
            </Grid>
          )}

          {contract.terminationClause && (
            <Grid item xs={12}>
              <Typography variant="subtitle2" color="textSecondary">
                Cláusula de Terminación
              </Typography>
              <Typography variant="body1">{contract.terminationClause}</Typography>
            </Grid>
          )}

          {contract.notes && (
            <Grid item xs={12}>
              <Typography variant="subtitle2" color="textSecondary">
                Notas
              </Typography>
              <Typography variant="body1">{contract.notes}</Typography>
            </Grid>
          )}

          <Grid item xs={12}>
            <Divider />
          </Grid>

          <Grid item xs={12}>
            <Typography variant="subtitle2" color="textSecondary">
              Información de Auditoría
            </Typography>
            <Typography variant="body2">
              Creado por: {contract.createdBy.email}
            </Typography>
            <Typography variant="body2">
              Última modificación por: {contract.lastModifiedBy.email}
            </Typography>
            {contract.approvedBy && (
              <Typography variant="body2">
                Aprobado por: {contract.approvedBy.email}
              </Typography>
            )}
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Box sx={{ display: 'flex', gap: 1, width: '100%', px: 2 }}>
          {renderStatusActions()}
          <Button onClick={onClose}>Cerrar</Button>
        </Box>
      </DialogActions>
    </>
  );
};

export default ContractDetails;