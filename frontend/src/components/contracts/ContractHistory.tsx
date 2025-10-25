import React, { useEffect, useState } from 'react';
import {
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  Typography,
} from '@mui/material';
import { format } from 'date-fns';
import { ContractHistoryEntry, contractsApi } from '../../services/api/contracts';
import { useSnackbar } from 'notistack';

interface ContractHistoryProps {
  contractId: string;
  onClose: () => void;
}

const ContractHistory: React.FC<ContractHistoryProps> = ({
  contractId,
  onClose,
}) => {
  const [history, setHistory] = useState<ContractHistoryEntry[]>([]);
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    loadHistory();
  }, [contractId]);

  const loadHistory = async () => {
    try {
      const historyData = await contractsApi.getContractHistory(contractId);
      setHistory(historyData);
    } catch (error) {
      enqueueSnackbar('Error al cargar el historial', { variant: 'error' });
    }
  };

  const getTimelineDotColor = (changeType: string) => {
    switch (changeType) {
      case 'created':
        return 'success';
      case 'updated':
        return 'info';
      case 'status_changed':
        return 'warning';
      case 'approved':
        return 'primary';
      case 'renewed':
        return 'secondary';
      case 'terminated':
        return 'error';
      default:
        return 'grey';
    }
  };

  const formatChanges = (changes: Record<string, any>): string[] => {
    return Object.entries(changes).map(([key, value]) => {
      if (typeof value === 'object' && value.old !== undefined && value.new !== undefined) {
        return `${key}: ${value.old} → ${value.new}`;
      }
      return `${key}: ${JSON.stringify(value)}`;
    });
  };

  return (
    <>
      <DialogTitle>Historial del Contrato</DialogTitle>
      <DialogContent>
        <Timeline>
          {history.map((entry) => (
            <TimelineItem key={entry.id}>
              <TimelineSeparator>
                <TimelineDot color={getTimelineDotColor(entry.changeType)} />
                <TimelineConnector />
              </TimelineSeparator>
              <TimelineContent>
                <Typography variant="subtitle2">
                  {format(new Date(entry.createdAt), 'dd/MM/yyyy HH:mm')}
                </Typography>
                <Typography variant="body1">
                  {entry.user.email} - {entry.changeType}
                </Typography>
                {entry.comments && (
                  <Typography variant="body2" color="textSecondary">
                    {entry.comments}
                  </Typography>
                )}
                {entry.changes && (
                  <Typography
                    variant="body2"
                    component="div"
                    color="textSecondary"
                    sx={{ mt: 1 }}
                  >
                    {formatChanges(entry.changes).map((change, index) => (
                      <div key={index}>{change}</div>
                    ))}
                  </Typography>
                )}
              </TimelineContent>
            </TimelineItem>
          ))}
        </Timeline>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cerrar</Button>
      </DialogActions>
    </>
  );
};

export default ContractHistory;