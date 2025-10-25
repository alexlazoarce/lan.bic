import React from 'react';
import {
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Box,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { Contract, ContractType } from '../../types/contract';
import { contractsApi, ContractDTO } from '../../services/api/contracts';
import { useSnackbar } from 'notistack';

interface ContractFormProps {
  contract?: Contract | null;
  isEditing?: boolean;
  onSubmit: () => void;
  onCancel: () => void;
}

const validationSchema = Yup.object({
  title: Yup.string().required('El título es requerido'),
  description: Yup.string().required('La descripción es requerida'),
  type: Yup.string().required('El tipo es requerido'),
  partyName: Yup.string().required('El nombre de la parte es requerido'),
  partyEmail: Yup.string()
    .email('Email inválido')
    .required('El email es requerido'),
  value: Yup.number()
    .positive('El valor debe ser positivo')
    .required('El valor es requerido'),
  currency: Yup.string().required('La moneda es requerida'),
  startDate: Yup.date().required('La fecha de inicio es requerida'),
  endDate: Yup.date()
    .min(
      Yup.ref('startDate'),
      'La fecha de fin debe ser posterior a la fecha de inicio'
    )
    .required('La fecha de fin es requerida'),
});

const ContractForm: React.FC<ContractFormProps> = ({
  contract,
  isEditing,
  onSubmit,
  onCancel,
}) => {
  const { enqueueSnackbar } = useSnackbar();

  const initialValues: ContractDTO = {
    title: contract?.title || '',
    description: contract?.description || '',
    type: contract?.type || ContractType.SERVICE,
    partyName: contract?.partyName || '',
    partyEmail: contract?.partyEmail || '',
    partyPhone: contract?.partyPhone || '',
    value: contract?.value || 0,
    currency: contract?.currency || 'USD',
    startDate: contract?.startDate ? new Date(contract.startDate) : new Date(),
    endDate: contract?.endDate ? new Date(contract.endDate) : new Date(),
    renewalTerms: contract?.renewalTerms || '',
    autoRenewal: contract?.autoRenewal || false,
    terminationClause: contract?.terminationClause || '',
    customFields: contract?.customFields || {},
    attachments: contract?.attachments || [],
    notes: contract?.notes || '',
  };

  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit: async (values) => {
      try {
        if (isEditing && contract) {
          await contractsApi.updateContract(contract.id, values);
          enqueueSnackbar('Contrato actualizado exitosamente', {
            variant: 'success',
          });
        } else {
          await contractsApi.createContract(values);
          enqueueSnackbar('Contrato creado exitosamente', {
            variant: 'success',
          });
        }
        onSubmit();
      } catch (error) {
        enqueueSnackbar('Error al guardar el contrato', { variant: 'error' });
      }
    },
  });

  return (
    <>
      <DialogTitle>
        {isEditing ? 'Editar Contrato' : 'Nuevo Contrato'}
      </DialogTitle>
      <form onSubmit={formik.handleSubmit}>
        <DialogContent>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                name="title"
                label="Título"
                value={formik.values.title}
                onChange={formik.handleChange}
                error={formik.touched.title && Boolean(formik.errors.title)}
                helperText={formik.touched.title && formik.errors.title}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                name="description"
                label="Descripción"
                value={formik.values.description}
                onChange={formik.handleChange}
                error={
                  formik.touched.description && Boolean(formik.errors.description)
                }
                helperText={
                  formik.touched.description && formik.errors.description
                }
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Tipo de Contrato</InputLabel>
                <Select
                  name="type"
                  value={formik.values.type}
                  onChange={formik.handleChange}
                  label="Tipo de Contrato"
                >
                  {Object.values(ContractType).map((type) => (
                    <MenuItem key={type} value={type}>
                      {type}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                name="partyName"
                label="Nombre de la Parte"
                value={formik.values.partyName}
                onChange={formik.handleChange}
                error={
                  formik.touched.partyName && Boolean(formik.errors.partyName)
                }
                helperText={formik.touched.partyName && formik.errors.partyName}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                name="partyEmail"
                label="Email de la Parte"
                value={formik.values.partyEmail}
                onChange={formik.handleChange}
                error={
                  formik.touched.partyEmail && Boolean(formik.errors.partyEmail)
                }
                helperText={formik.touched.partyEmail && formik.errors.partyEmail}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                name="partyPhone"
                label="Teléfono de la Parte"
                value={formik.values.partyPhone}
                onChange={formik.handleChange}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                name="value"
                label="Valor"
                type="number"
                value={formik.values.value}
                onChange={formik.handleChange}
                error={formik.touched.value && Boolean(formik.errors.value)}
                helperText={formik.touched.value && formik.errors.value}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                name="currency"
                label="Moneda"
                value={formik.values.currency}
                onChange={formik.handleChange}
                error={formik.touched.currency && Boolean(formik.errors.currency)}
                helperText={formik.touched.currency && formik.errors.currency}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <DatePicker
                label="Fecha de Inicio"
                value={formik.values.startDate}
                onChange={(date) => formik.setFieldValue('startDate', date)}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <DatePicker
                label="Fecha de Fin"
                value={formik.values.endDate}
                onChange={(date) => formik.setFieldValue('endDate', date)}
                minDate={formik.values.startDate}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                name="renewalTerms"
                label="Términos de Renovación"
                multiline
                rows={2}
                value={formik.values.renewalTerms}
                onChange={formik.handleChange}
              />
            </Grid>

            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    name="autoRenewal"
                    checked={formik.values.autoRenewal}
                    onChange={formik.handleChange}
                  />
                }
                label="Renovación Automática"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                name="terminationClause"
                label="Cláusula de Terminación"
                multiline
                rows={2}
                value={formik.values.terminationClause}
                onChange={formik.handleChange}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                name="notes"
                label="Notas"
                multiline
                rows={3}
                value={formik.values.notes}
                onChange={formik.handleChange}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={onCancel}>Cancelar</Button>
          <Button type="submit" variant="contained" color="primary">
            {isEditing ? 'Actualizar' : 'Crear'}
          </Button>
        </DialogActions>
      </form>
    </>
  );
};

export default ContractForm;