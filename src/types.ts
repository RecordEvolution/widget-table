

export interface Column {
    header: string
    type: string
    order: number
    width: string
    precision: number
    fontSize: string
    fontWeight: number
    color: string
    border: string
    stateMap: any
}
export interface Table {
    headerFontSize: number
    headerBackground: string
    rowHeight: string
    rowBorder: string
    columns: Column[]
    rows: any[]
}

export interface Settings {
    title: string
    subTitle: string
  }
export interface InputData {
    settings: Settings
    table: Table
}