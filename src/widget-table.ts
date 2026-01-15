import { html, css, LitElement, PropertyValues, nothing } from 'lit'
import { repeat } from 'lit/directives/repeat.js'
import { ifDefined } from 'lit/directives/if-defined.js'
import { property, state, customElement } from 'lit/decorators.js'
import { InputData, Values } from './definition-schema.js'

import '@vaadin/grid'
import '@vaadin/grid/vaadin-grid-sort-column.js'
import { columnBodyRenderer } from '@vaadin/grid/lit.js'

type Column = Exclude<InputData['columns'], undefined>[number]
type RowData = { [key: string]: Values[number] }
type Theme = {
    theme_name: string
    theme_object: any
}
@customElement('widget-table-versionplaceholder')
export class WidgetTable extends LitElement {
    @property({ type: Object })
    inputData?: InputData

    @property({ type: Object })
    theme?: Theme

    @state()
    rows: RowData[] = []

    @state() private themeBgColor?: string
    @state() private themeTitleColor?: string
    @state() private themeSubtitleColor?: string
    @state() private themeRowHoverColor?: string
    @state() private themeBorderColor?: string

    version: string = 'versionplaceholder'

    update(changedProperties: Map<string, any>) {
        if (changedProperties.has('inputData')) {
            this.transformInputData()
        }

        if (changedProperties.has('theme')) {
            this.registerTheme(this.theme)
        }

        super.update(changedProperties)
    }

    protected firstUpdated(_changedProperties: PropertyValues): void {
        this.registerTheme(this.theme)
    }

    registerTheme(theme?: Theme) {
        const cssTextColor = getComputedStyle(this).getPropertyValue('--re-text-color').trim()
        const cssBgColor = getComputedStyle(this).getPropertyValue('--re-tile-background-color').trim()
        const cssHoverColor = getComputedStyle(this).getPropertyValue('--re-hover-color').trim()
        const cssBorderColor = getComputedStyle(this).getPropertyValue('--re-border-color').trim()

        this.themeBgColor = cssBgColor || this.theme?.theme_object?.backgroundColor
        this.themeTitleColor = cssTextColor || this.theme?.theme_object?.title?.textStyle?.color
        this.themeSubtitleColor =
            cssTextColor || this.theme?.theme_object?.title?.subtextStyle?.color || this.themeTitleColor
        this.themeRowHoverColor = cssHoverColor || this.computeHoverColor(this.themeBgColor)
        this.themeBorderColor = cssBorderColor || this.computeBorderColor(this.themeTitleColor)
    }

    private computeHoverColor(bgColor?: string): string {
        // Create a subtle hover effect based on background
        if (!bgColor || bgColor === 'transparent' || bgColor === 'rgba(0, 0, 0, 0)') {
            return 'rgba(128, 128, 128, 0.1)'
        }
        return 'rgba(128, 128, 128, 0.1)'
    }

    private computeBorderColor(textColor?: string): string {
        // Create a subtle border color based on text color
        if (!textColor) {
            return 'rgba(128, 128, 128, 0.2)'
        }
        return 'rgba(128, 128, 128, 0.2)'
    }

    transformInputData() {
        if (!this?.inputData?.columns?.length) {
            this.rows = []
            return
        }

        const cols = this.inputData.columns.map((col) => col?.values ?? [])
        const maxLength = Math.max(...cols.map((vals) => vals?.length ?? 0))
        const rows: RowData[] = []

        for (let r = 0; r < maxLength; r++) {
            const row: RowData = {}
            for (let c = 0; c < cols.length; c++) {
                row[`col_${c}`] = cols?.[c]?.[r] ?? {}
            }
            rows.push(row)
        }

        this.rows = rows.reverse()
    }

    renderCell(cell: Values[number], colIndex: number) {
        const colDef = this?.inputData?.columns?.[colIndex]
        if (!colDef) return nothing

        switch (colDef?.type) {
            case 'string':
                return this.renderString(cell?.value, colDef)
            case 'number':
                return this.renderNumber(cell?.value, colDef)
            case 'boolean':
                return this.renderBoolean(cell?.value, colDef)
            case 'state':
                return this.renderState(cell?.value, colDef)
            case 'button':
                return this.renderButton(cell, colDef)
            case 'image':
                return this.renderImage(cell, colDef)
            default:
                return html`${cell?.value ?? ''}`
        }
    }

    renderString(value: string | undefined, colDef: Column) {
        return html`${value ?? ''}`
    }

    renderNumber(value: any, colDef: Column) {
        const num = typeof value === 'number' ? value : parseFloat(value)
        if (isNaN(num)) return ''
        const precision = colDef?.styling?.precision ?? 0
        return html`${num.toFixed(precision)}`
    }

    renderBoolean(value: any, colDef: Column) {
        return value ? '✓' : '-'
    }

    renderState(value: any, colDef: Column) {
        const _stateMap = colDef.styling?.stateMap
            ?.split(',')
            .map((d: string) => d.trim().replaceAll("'", ''))
        const stateMap = _stateMap?.reduce((p: any, c: string, i: number, a: any[]) => {
            if (i % 2 === 0) p[c] = a[i + 1]
            return p
        }, {})
        return html`<div
            class="statusbox"
            style="background-color: ${stateMap?.[String(value)] ?? '#ccc'}"
        ></div>`
    }

    renderButton(cell: Values[number], colDef: Column) {
        return html`<a href="${cell?.link ?? ''}" target="_blank">${cell?.value ?? ''}</a>`
    }

    renderImage(cell: Values[number], colDef: Column) {
        if (!cell?.value) return nothing
        return html`<a href="${cell?.link ?? ''}" target="_blank"><img src="${cell.value}" /></a>`
    }

    getTextAlign(colDef: Column) {
        switch (colDef.type) {
            case 'number':
                return 'end'
            case 'button':
            case 'string':
                return 'start'
            case 'boolean':
            case 'state':
            case 'image':
                return 'center'
            default:
                return 'start'
        }
    }

    static styles = css`
        :host {
            display: flex;
            flex-direction: column;
            font-family: sans-serif;
            box-sizing: border-box;
            position: relative;
            height: 100%;
            width: 100%;
            flex: 1;
        }

        .paging:not([active]) {
            display: none !important;
        }

        .wrapper {
            display: flex;
            flex-direction: column;
            flex: 1;
            min-height: 0;
            min-width: 0;
        }

        h3 {
            margin: 0;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            padding: 16px 0px 0px 16px;
            box-sizing: border-box;
        }
        p {
            margin: 10px 0 16px 0;
            font-size: 14px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            padding-left: 16px;
            box-sizing: border-box;
        }

        vaadin-grid {
            flex: 1;
            --vaadin-grid-cell-padding: var(--cell-padding-vertical, 8px) var(--cell-padding-horizontal, 16px);
            --vaadin-grid-column-border-width: var(--grid-column-border-width, 0);
            --vaadin-grid-border-color: var(--grid-border-color, rgba(128, 128, 128, 0.3));
            background: var(--grid-bg-color, transparent);
        }

        vaadin-grid::part(cell) {
            background: var(--grid-bg-color, transparent);
            color: var(--grid-text-color, inherit);
        }

        vaadin-grid::part(header-cell) {
            font-size: var(--header-font-size, 14px);
            background: var(--grid-header-bg-color, transparent);
            color: var(--grid-text-color, inherit);
        }

        vaadin-grid::part(body-cell) {
            background: var(--grid-bg-color, transparent);
            color: var(--grid-text-color, inherit);
        }

        vaadin-grid::part(even-row-cell) {
            background: var(--grid-bg-color, transparent);
        }

        vaadin-grid::part(odd-row-cell) {
            background: var(--grid-bg-color, transparent);
        }

        vaadin-grid-sorter {
            flex: 1;
            justify-content: inherit;
        }

        vaadin-grid-cell-content {
            display: flex;
            align-items: center;
            height: 100%;
        }

        .grid-container {
            display: flex;
            flex-direction: column;
            flex: 1;
            min-height: 0;
            min-width: 0;
            overflow: hidden;
        }

        .grid-container.overflow {
            overflow-x: auto;
        }

        .grid-container.overflow vaadin-grid {
            min-width: max-content;
        }

        .statusbox {
            width: 24px;
            height: 12px;
            border-radius: 6px;
        }

        img {
            max-width: 100%;
            max-height: 40px;
            object-fit: contain;
        }

        .no-data {
            font-size: 20px;
            display: flex;
            height: 100%;
            width: 100%;
            text-align: center;
            align-items: center;
            justify-content: center;
        }

        .cell {
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
        }

        .cell-center {
            justify-content: center;
        }

        .cell-end {
            justify-content: flex-end;
        }

        .cell-start {
            justify-content: flex-start;
        }

        a,
        a:visited,
        a:hover,
        a:active {
            color: inherit;
            text-decoration: underline;
        }
    `

    render() {
        const columns = this.inputData?.columns ?? []

        return html`
            <div
                class="wrapper"
                style="color: ${this.themeTitleColor}; background-color: ${this.themeBgColor}"
            >
                <header>
                    <h3 class="paging" ?active=${this.inputData?.title}>${this.inputData?.title}</h3>
                    <p
                        class="paging"
                        ?active=${this.inputData?.subTitle}
                        style="color: ${this.themeSubtitleColor}"
                    >
                        ${this.inputData?.subTitle}
                    </p>
                </header>

                <div class="grid-container ${this.inputData?.horizontalOverflow ? 'overflow' : ''}">
                    <vaadin-grid
                        class="paging"
                        ?active=${this.rows?.length}
                        .items=${this.rows}
                        theme="no-row-borders no-border"
                        style="
                            --header-font-size: ${this.inputData?.styling?.headerFontSize || '14px'};
                            --cell-padding-horizontal: ${this.inputData?.styling?.cellPaddingHorizontal ||
                        '16px'};
                            --cell-padding-vertical: ${this.inputData?.styling?.cellPaddingVertical || '8px'};
                            --grid-bg-color: ${this.themeBgColor || 'transparent'};
                            --grid-header-bg-color: ${this.themeBgColor || 'transparent'};
                            --grid-text-color: ${this.themeTitleColor || 'inherit'};
                            --grid-hover-color: ${this.themeRowHoverColor || 'rgba(128, 128, 128, 0.1)'};
                            --grid-column-border-width: ${this.inputData?.styling?.columnSeparators
                            ? '1px'
                            : '0'};
                            --grid-border-color: ${this.themeBorderColor || 'rgba(128, 128, 128, 0.3)'};
                        "
                    >
                        ${repeat(
                            columns,
                            (col, i) => `${col.header}-${i}`,
                            (col, colIndex) => html`
                                <vaadin-grid-sort-column
                                    .flexGrow=${col.styling?.width ? 0 : 1}
                                    width=${ifDefined(
                                        col.styling?.width ? `${col.styling.width}` : undefined
                                    )}
                                    ?autoWidth=${this.inputData?.horizontalOverflow && !col.styling?.width}
                                    resizable
                                    .textAlign=${this.getTextAlign(col)}
                                    .header=${col.header}
                                    path=${`col_${colIndex}.value`}
                                    ${columnBodyRenderer<RowData>(
                                        (item) => html`
                                            <div
                                                class="cell cell-${this.getTextAlign(col)}"
                                                style="font-size: ${col.styling?.fontSize}; font-weight: ${col
                                                    .styling?.fontWeight}; color: ${col.styling?.color ||
                                                this.themeTitleColor}"
                                            >
                                                ${this.renderCell(item[`col_${colIndex}`], colIndex)}
                                            </div>
                                        `,
                                        [colIndex, col, this.themeTitleColor]
                                    )}
                                ></vaadin-grid-sort-column>
                            `
                        )}
                    </vaadin-grid>
                </div>

                <div class="paging no-data" ?active=${!this.rows?.length}>No Data</div>
            </div>
        `
    }
}
