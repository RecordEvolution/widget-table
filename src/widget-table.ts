import { html, css, LitElement } from 'lit';
import { repeat } from 'lit/directives/repeat.js'
import { property, state, customElement } from 'lit/decorators.js';
import { InputData, Column } from './types.js'

@customElement('widget-table')
export class WidgetTable extends LitElement {
  
  @property({type: Object}) 
  inputData?: InputData = undefined

  constructor() {
    super()

  }

  renderCell(value: any, i: number) {
    const colDef = this?.inputData?.table.columns[i]

    switch(colDef?.type) {
      case "string":
        return this.renderString(value, colDef)
      case "number":
        return this.renderNumber(value, colDef)
      case "boolean":
        return this.renderBoolean(value, colDef)
      case "state":
        return this.renderState(value, colDef)
      case "button":
        return this.renderButton(value, colDef)
      case "image":
        return this.renderImage(value, colDef)
    }
  }

  renderString(value: any, colDef: Column) {
    return html`${value}`
  }

  renderNumber(value: number, colDef: Column) {
    if (typeof value !== 'number' || isNaN(value)) return ''
    return html`${value?.toFixed(colDef.precision)}`
  }

  renderBoolean(value: any, colDef: Column) {
    return value ? '✓' : '-'
  }

  renderState(value: any, colDef: Column) {
    return html`<div class="statusbox" style="background-color: ${colDef.stateMap[value]}"></div>`
  }

  renderButton(value: any, colDef: Column) {
    return html`<a href="${value}">${colDef.label}</a>`
  }

  renderImage(value: any, colDef: Column) {
    return html`<img src="${value}"/>`
  }

  getTextAlign(colDef: Column) {
    switch(colDef.type){
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

    .paging:not([active]) { display: none !important; }

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
      color: var(--re-text-color, #000);
    }
    p {
      margin: 10px 0 16px 0;
      font-size: 14px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      color: var(--re-text-color, #000);
    }

    .tableFixHead {
      overflow-y: auto;
      height: 100%;
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
    tr {
      border-bottom: 1px solid #ddd;
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
  `;

  render() {
    return html`
      <style>
        ${repeat(this.inputData?.table?.columns ?? [], (col, i) => i, (col, i) => {
          return html`
            .column-${i} {
              width: ${col.width}; 
              text-align: ${this.getTextAlign(col)};
              font-size: ${col.fontSize};
              font-weight: ${col.fontWeight};
              color: ${col.color};
              border: ${col.border};
              height: ${this?.inputData?.table.rowHeight};
            }

            .header-${i} {
              width: ${col.width}; 
              text-align: ${this.getTextAlign(col)};
              border: ${col.border};
            }

            thead {
              font-size: ${this?.inputData?.table.headerFontSize};
              background: ${this?.inputData?.table.headerBackground};
            }

            tr {
              height: ${this?.inputData?.table.rowHeight};
              border-bottom: ${this?.inputData?.table.rowBorder};
            }
        `})}
      </style>


      <div class="wrapper">
        <header>
            <h3 class="paging" ?active=${this.inputData?.settings?.title}>${this.inputData?.settings?.title}</h3>
            <p class="paging" ?active=${this.inputData?.settings?.subTitle}>${this.inputData?.settings?.subTitle}</p>
        </header>
        <div class="tableFixHead">

          <table>
          <thead>
              <tr>
                ${repeat(this.inputData?.table?.columns ?? [], col => col, (col, i) => {
                  return html`
                  <th class="header-${i}">${col.header}</th>  
                `})}
              </tr>
            </thead>
            <tbody>
              ${repeat(this.inputData?.table?.rows.reverse() ?? [], (row, idx) => idx, (row) => {
                return html`
                <tr>
                  ${repeat(row, c => c, (cell, i) => html`
                    <td class="column-${i}">${this.renderCell(cell, i)}</td>
                  `)}
                </tr>`
              })}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }
}