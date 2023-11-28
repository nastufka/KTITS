//@ts-nocheck
import { ax } from '@/shared/api/common'
import type { LoginParams, Channel } from '../model/types'
import { useRoomsStore } from '@/entities/room/model/roomsStore'

const roomsStore = useRoomsStore()

const initPlugin = async (id: number) => {
  const init = new Promise<void>((resolve, reject) => {
    
    WebVideoCtrl.I_InitPlugin({
      bWndFull: false,
      iWndowType: 1,
      cbInitPluginComplete: async function () {
        const result = await WebVideoCtrl.I_InsertOBJECTPlugin(`videoDiv_${id}`)
        const success = await result.success
        roomsStore.setPluginConnected(id, success)
        if (success) {
          resolve()
        } else
          reject({ code: result.code })
      }
    })
  })
  return init
}
export const startRealPlay = (camera) => {
  WebVideoCtrl.I_StartRealPlay(`${camera.ip}_${camera.port}`, {
    iStreamType: 1,
    iChannelID: 1,
    bZeroChannel: false,
    iWndIndex: camera.channel_id,
    success: function () {

        console.log('success play')             
    },
    error: function (oError) {
      console.log('error play', oError)     
    }
  });
}
const getWindowStatus = () => {
  return WebVideoCtrl.I_GetWindowStatus(null)
}
const initLogin = (p: LoginParams) => {
  roomsStore.addToWndSet(p.camId)
  const wId = [...roomsStore.wndSet].findIndex(i => i === p.camId)
  const loginPromise = new Promise<void>((resolve, reject) => {
    setTimeout(() => {
      WebVideoCtrl.I_Login(p.ip, p.protocol, p.port, p.login, p.password, {
        timeout: 0,
        success: (xmlDoc: string) => {
          WebVideoCtrl.addToWndSet({
            iWndIndex: wId,
            szIP: p.ip,
            iCGIPort: '80',
            szDeviceIdentify: `${p.ip}_80`,
            iChannelID: 1
          })
          resolve(true)
        },
        error: (oError: {}) => {
          console.log('error login ' + p.camId)
        }
      })
    }, 100)
  })
  return loginPromise
}
export const loginToPlugin = async (p: LoginParams) => {
  try {
    await initPlugin(p.camId)
    return await initLogin(p)
  } catch (err) {
    console.log(err)
  }
}
export const getCapture = async (url: string) => {
  const blob = await ax.get(url, { responseType: 'blob' }).then(res => res.data)
  const base64Img = await blobToBase64(blob)
  return base64Img
}
export const blobToBase64 = function(blob: Blob): Promise<any> {
  return new Promise(resolve => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.readAsDataURL(blob)
  })
}
