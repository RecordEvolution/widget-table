

export interface Column {
    header: string
    type: string
    width: string
    precision: number
    fontSize: string
    fontWeight: number
    color: string
    border: string
    stateMap: any
    values: any[]
}

export interface Settings {
    title: string
    subTitle: string
    headerFontSize: number
    headerBackground: string
    rowHeight: string
    rowBorder: string
  }
export interface InputData {
    settings: Settings
    columns: Column[]
    rows: any[][]
}