import KiteConnect from './connect';
import KiteTicker from './ticker';

export { KiteConnect, KiteTicker };

// Re-export all types from connect.d.ts
export type {
  Exchanges,
  TransactionType,
  PositionTypes,
  Product,
  OrderType,
  Variety,
  Validity,
  TriggerType,
  SessionData,
  Trigger,
  PortfolioHolding,
  Instrument,
  HistoricalData,
  UserMargin,
  MFHolding,
  MFInstrument,
  MFOrder,
  MFSIP,
  Order,
  Trade,
  Position,
  Margin,
  MarginOrder,
  VirtualContractParam,
  VirtualContractResponse,
  GTTParams,
  Connect,
  KiteConnectParams
} from './connect';

// Re-export all types from ticker.d.ts
export type {
  KiteTickerParams,
  Ticker
} from './ticker';

// Re-export tick types from interfaces (REQUIRED for consumer access)
export type {
  Tick,
  LTPTick,
  QuoteTick,
  FullTick
} from '../interfaces/ticker';