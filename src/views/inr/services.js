import request from './utils/request'
export const getPayments = (id) => {
  return request({
    url: `/api/payments/${id}`,
    method: 'GET',
  })
}

export const upload = (data) => {
  return request({
    url: '/api/payments-upload',
    method: 'POST',
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    data,
  })
}

export const addPayment = (data) => {
  return request({
    url: '/api/payments-no',
    method: 'POST',
    data,
  })
}
