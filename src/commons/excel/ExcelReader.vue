<template>
  <div>
      <input type="file" :accept="accept" @change="handleSelectedFile"/>
  </div>
</template>

<script>
import http from "../../client/http-common";
import XLSX from 'xlsx'

export default {
  props: {
    accept: {
      type: String,
      default: '.xlsx'
    }
  },
  components: {  },
  data() {
    return {
      rawFile: null,
      workbook: null,
      tableData: {
        header: [],
        body: []
      }
    };
  },
  methods: {
    handleSelectedFile(e){
      if (this.rawFile !== null) {
        return
      }
      this.rawFile = e.target.files[0]
      this.fileConvertToWorkbook(this.rawFile)
        .then((workbook) => {
          let xlsxArr = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]], {raw: false, defval:null, dateNF: 'dd/mm/yyyy'})
          console.log('xlsxArr', xlsxArr)
          this.workbook = workbook
          this.initTable(
            this.xlsxArrToTableArr(xlsxArr)
          )
        })
        .catch((err) => {
          console.error(err)
        })
    },
    fileConvertToWorkbook (file) {
      let reader = new FileReader()
      let fixdata = (data) => {
        let o = "", l = 0, w = 10240
        for( ; l<data.byteLength/w ; ++l) {
          o += String.fromCharCode.apply(null,new Uint8Array(data.slice(l*w,l*w+w)))
        }
        o += String.fromCharCode.apply(null, new Uint8Array(data.slice(l*w)))
        return o
      }
      return new Promise((resolve, reject) => {
        try {
          reader.onload = (renderEvent) => {
            let data = renderEvent.target.result
            console.log('ExcelReader : data', data)
            if(this.rABS) {
              console.log('11111')
              /* if binary string, read with type 'binary' */
              resolve(XLSX.read(data, {type: 'binary', cellText:false, cellDates:true}))
            } else {
              console.log('2222')
              /* if array buffer, convert to base64 */
              let arr = fixdata(data)
              resolve(XLSX.read(btoa(arr), {type: 'base64', cellText:false, cellDates:true}))
            }
          }
          reader.onerror = (error) => {
            reject(error)
          }
          if (this.rABS) {
            reader.readAsBinaryString(file)
          } else {
            reader.readAsArrayBuffer(file)
          }
        } catch (error) {
          reject(error)
        }
      })
    },
    xlsxArrToTableArr (xlsxArr) {
      let tableArr = []
      let length = 0
      let maxLength = 0
      let maxLengthIndex = 0
      xlsxArr.forEach((item, index) => {
        length = Object.keys(item).length
        if (maxLength < length) {
          maxLength = length
          maxLengthIndex = index
        }
      })
      let tableHeader = Object.keys(xlsxArr[maxLengthIndex])
      let rowItem = {}
      xlsxArr.forEach((item) => {
        rowItem = {}
        for (let i = 0; i < maxLength; i++) {
          rowItem[tableHeader[i]] = item[tableHeader[i]] || ''
        }
        tableArr.push(rowItem)
      })
      return {
        header: tableHeader,
        data: tableArr
      }
    },
    initTable ( {data, header} ) {
      this.tableData.header = header
      this.tableData.body = data
      this.$emit('on-select-file', this.tableData)
      this.clearAllData();
    },
    clearAllData () {
      //document.getElementById(this.uploadInputId).value = null
      this.tableData = {
        header: [],
        body: []
      }
      this.rawFile = null
      this.workbook = null
    }
  },
  computed: {
    
  },
  mixins: []
};
</script>

<style scoped>

</style>