import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

export type RootStackParamList = {
  Home: undefined;
  MedicationDetail: { medicationId: string };
  AddMedication: undefined;
  EditMedication: { medicationId: string };
  Schedule: undefined;
  Device: undefined;
  Settings: undefined;
};

export type MedicationDetailScreenRouteProp = RouteProp<
  RootStackParamList,
  'MedicationDetail'
>;

export type EditMedicationScreenRouteProp = RouteProp<
  RootStackParamList,
  'EditMedication'
>;

export type HomeScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'Home'
>;

export type ScheduleScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'Schedule'
>;

export type MedicationDetailScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'MedicationDetail'
>;

export type AddMedicationScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'AddMedication'
>;

export type EditMedicationScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'EditMedication'
>; 