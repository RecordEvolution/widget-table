import { html, css, LitElement } from 'lit'
import { repeat } from 'lit/directives/repeat.js'
import { property, state, customElement } from 'lit/decorators.js'
import { InputData } from './definition-schema.js'

type Column = Exclude<InputData['columns'], undefined>[number]

@customElement('widget-table-versionplaceholder')
export class WidgetTable extends LitElement {
    @property({ type: Object })
    inputData?: InputData

    @state()
    rows: any[] = []

    version: string = 'versionplaceholder'

    update(changedProperties: Map<string, any>) {
        if (changedProperties.has('inputData')) {
            this.transformInputData()
        }
        super.update(changedProperties)
    }

    transformInputData() {
        if (!this?.inputData?.columns?.length) return

        const rows: any[][] = []
        this.inputData.columns.forEach((col, i) => {
            col.values?.forEach((v, j) => {
                if (rows.length <= j) rows.push([])
                rows[j].push(v)
            })
        })
        this.rows = rows
    }

    renderCell(value: any, i: number) {
        const colDef = this?.inputData?.columns?.[i]

        switch (colDef?.type) {
            case 'string':
                return this.renderString(value, colDef)
            case 'number':
                return this.renderNumber(value, colDef)
            case 'boolean':
                return this.renderBoolean(value, colDef)
            case 'state':
                return this.renderState(value, colDef)
            case 'button':
                return this.renderButton(value, colDef)
            case 'image':
                return this.renderImage(value, colDef)
        }
    }

    renderString(value: any, colDef: Column) {
        return html`${value}`
    }

    renderNumber(value: number, colDef: Column) {
        if (typeof value !== 'number' || isNaN(value)) return ''
        return html`${value?.toFixed(colDef?.styling?.precision)}`
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
        return html`<div class="statusbox" style="background-color: ${stateMap[value]}"></div>`
    }

    renderButton(value: any, colDef: Column) {
        return html`<a href="${value}" target="_blank">${colDef.header}</a>`
    }

    renderImage(value: any, colDef: Column) {
        return html`<img src="${value}" />`
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
            display: block;
            font-family: sans-serif;
            box-sizing: border-box;
            position: relative;
            margin: auto;
        }

        .paging:not([active]) {
            display: none !important;
        }

        .wrapper {
            display: flex;
            flex-direction: column;
            height: 100%;
            width: 100%;
        }

        h3 {
            margin: 0;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            padding: 16px 0px 0px 16px;
            box-sizing: border-box;
            color: var(--re-text-color, #000);
        }
        p {
            margin: 10px 0 16px 0;
            font-size: 14px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            padding-left: 16px;
            box-sizing: border-box;
            color: var(--re-text-color, #000);
        }

        .tableFixHead {
            overflow-y: auto;
            border-radius: 6px;
        }
        .tableFixHead thead {
            position: sticky;
            top: 0px;
            overflow-x: auto;
        }
        table {
            border-collapse: collapse;
            width: 100%;
        }
        th,
        td {
            padding: 0px 16px;
            box-sizing: border-box;
        }

        .statusbox {
            width: 24px;
            height: 12px;
            margin: auto;
            border-radius: 6px;
        }

        img {
            width: 100%; /* Set the width of the container */
            height: 100%;
            object-fit: contain;
        }

        md-filled-tonal-button {
            --md-filled-tonal-button-container-color: #ddd;
            --md-filled-tonal-button-label-text-font: sans-serif;
            height: 24px;
        }

        th {
            color: var(--re-text-color, #000) !important;
        }

        .no-data {
            font-size: 20px;
            color: var(--re-text-color, #000);
            display: flex;
            height: 100%;
            width: 100%;
            text-align: center;
            align-items: center;
            justify-content: center;
        }
    `

    render() {
        return html`
            <style>
                ${repeat(
                    this.inputData?.columns ?? [],
                    (col, i) => i,
                    (col, i) => {
                        return html`
                            .column-${i} { width: ${col.styling?.width}; text-align:
                            ${this.getTextAlign(col)}; font-size: ${col.styling?.fontSize}; font-weight:
                            ${col.styling?.fontWeight}; color: ${col.styling?.color}; border:
                            ${col.styling?.border}; height: ${this?.inputData?.styling?.rowHeight}; }
                            .header-${i} { width: ${col.width}; text-align: ${this.getTextAlign(col)}; border:
                            ${col.border}; } thead { font-size: ${this?.inputData?.styling?.headerFontSize};
                            background: ${this?.inputData?.styling?.headerBackground}; } tr { height:
                            ${this?.inputData?.styling?.rowHeight}; border-bottom:
                            ${this?.inputData?.styling?.rowBorder ?? '1px solid #ddd'}; }
                        `
                    }
                )}
            </style>

            <div class="wrapper">
                <header>
                    <h3 class="paging" ?active=${this.inputData?.title}>${this.inputData?.title}</h3>
                    <p class="paging" ?active=${this.inputData?.subTitle}>${this.inputData?.subTitle}</p>
                </header>
                <div class="tableFixHead" style="${this.rows?.length ? 'height: 100%' : ''}">
                    <table>
                        <thead>
                            <tr>
                                ${repeat(
                                    this.inputData?.columns ?? [],
                                    (col) => col,
                                    (col, i) => {
                                        return html` <th class="header-${i}">${col.header}</th> `
                                    }
                                )}
                            </tr>
                        </thead>
                        <tbody class="paging" ?active=${this.rows?.length}>
                            ${repeat(
                                this.rows.reverse() ?? [],
                                (row, idx) => idx,
                                (row) => {
                                    return html` <tr>
                                        ${repeat(
                                            row,
                                            (c) => c,
                                            (cell, i) => html`
                                                <td class="column-${i}">${this.renderCell(cell, i)}</td>
                                            `
                                        )}
                                    </tr>`
                                }
                            )}
                        </tbody>
                    </table>
                </div>
                <div class="paging no-data" ?active=${!this.rows?.length}>No Data</div>
            </div>
        `
    }
}
