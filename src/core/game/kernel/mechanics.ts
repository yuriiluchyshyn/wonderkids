/**
 * The UI templates a game can be built on (PRD v4.0 §3.2) — the one list both
 * a game's catalog card (`mechanics`) and a task's payload (`template`) name
 * their board from. Always refer to a member (`Mechanics.DragMatch`), never to
 * its string: the string is only the wire value a CMS / database would store.
 */
export enum Mechanics {
  GridChoice = 'UI_GRID_CHOICE',
  DragMatch = 'UI_DRAG_MATCH',
  ChronoSequence = 'UI_CHRONO_SEQUENCE',
  MapPuzzle = 'UI_MAP_PUZZLE',
  BalanceScale = 'UI_BALANCE_SCALE',
  SorterBins = 'UI_SORTER_BINS',
  CashTray = 'UI_CASH_TRAY',
  Tangram = 'UI_TANGRAM',
  GridArea = 'UI_GRID_AREA',
  NumberMaze = 'UI_NUMBER_MAZE',
  BubblePop = 'UI_BUBBLE_POP',
  DotToDot = 'UI_DOT_TO_DOT',
  ColorMix = 'UI_COLOR_MIX',
}
