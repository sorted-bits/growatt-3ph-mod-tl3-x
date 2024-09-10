import { AccessMode } from '../../../models/enum/access-mode';
import { RegisterDataType } from '../../../models/enum/register-datatype';
import { ModbusRegister } from '../../../models/modbus-register';
import { inputRegisters as micInputRegisters } from '../growatt-tl/input-registers';

export const inputRegisters: ModbusRegister[] = [
  ...micInputRegisters,
  ModbusRegister.scale('measure_voltage_grid_l2', 42, 2, RegisterDataType.UINT16, 0.1, AccessMode.ReadOnly, { validValueMin: 0, validValueMax: 300 }, 2),
  ModbusRegister.scale('measure_voltage_grid_l3', 46, 2, RegisterDataType.UINT16, 0.1, AccessMode.ReadOnly, { validValueMin: 0, validValueMax: 300 }, 2),
];
