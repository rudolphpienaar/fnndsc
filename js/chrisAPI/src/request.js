/** * Imports ***/
import axios from 'axios';
import Collection from './cj';
import RequestException from './exception';

/**
 * Http request object.
 */
export default class Request {
  /**
   * Constructor
   *
   * @param {Object} auth - authentication object
   * @param {string} auth.token - authentication token
   * @param {string} contentType - request content type
   * @param {number} [timeout=30000] - request timeout
   */
  constructor(auth, contentType, timeout = 30000) {
    /** @type {Object} */
    this.auth = auth;

    /** @type {string} */
    this.contentType = contentType;

    /** @type {number} */
    this.timeout = timeout;
  }

  /**
   * Perform a GET request.
   *
   * @param {string} url - url of the resource
   * @param {?Object} params - search parameters
   * @return {Object} - JS Promise, resolves to an ``axios reponse`` object
   */
  get(url, params = null) {
    const config = this._getConfig(url, 'get');

    if (params) {
      config.params = params;
    }

    return Request._callAxios(config);
  }

  /**
   * Perform a POST request.
   *
   * @param {string} url - url of the resource
   * @param {Object} data - JSON data object
   * @param {?Object} uploadFileObj - custom file object
   * @param {Object} uploadFileObj.fname - file blob
   * @return {Object} - JS Promise, resolves to an ``axios reponse`` object
   */
  post(url, data, uploadFileObj = null) {
    return this._postOrPut('post', url, data, uploadFileObj);
  }

  /**
   * Perform a PUT request.
   *
   * @param {string} url - url of the resource
   * @param {Object} data - JSON data object
   * @param {?Object} uploadFileObj - custom file object
   * @param {Object} uploadFileObj.fname - file blob
   * @return {Object} - JS Promise, resolves to an ``axios reponse`` object
   */
  put(url, data, uploadFileObj = null) {
    return this._postOrPut('put', url, data, uploadFileObj);
  }

  /**
   * Perform a DELETE request.
   *
   * @param {string} url - url of the resource
   * @return {Object} - JS Promise, resolves to an ``axios reponse`` object
   */
  delete(url) {
    const config = this._getConfig(url, 'delete');

    return Request._callAxios(config);
  }

  /**
   * Internal method to make either a POST or PUT request.
   *
   * @param {string} requestMethod - either 'post' or 'put'
   * @param {string} url - url of the resource
   * @param {Object} data - JSON data object
   * @param {?Object} uploadFileObj - custom file object
   * @param {Object} uploadFileObj.fname - file blob
   * @return {Object} - JS Promise, resolves to an ``axios reponse`` object
   */
  _postOrPut(requestMethod, url, data, uploadFileObj = null) {
    const config = this._getConfig(url, requestMethod);
    config.data = data;

    if (uploadFileObj) {
      config['headers']['content-type'] = 'multipart/form-data';
      const bFormData = new FormData();

      for (let property in data) {
        if (data.hasOwnProperty(property)) {
          bFormData.set(property, data[property]);
        }
      }
      for (let property in uploadFileObj) {
        if (uploadFileObj.hasOwnProperty(property)) {
          bFormData.set(property, uploadFileObj[property]);
        }
      }
      config.data = bFormData;
    }

    return Request._callAxios(config);
  }

  /**
   * Internal method to create a config file for axios.
   *
   * @param {string} url - url of the resource
   * @param {string} method - request verb
   * @return {Object} - axios configuration object
   */
  _getConfig(url, method) {
    const config = {
      url: url,
      method: method,
      headers: {
        Accept: this.contentType,
        'content-type': this.contentType,
      },
      timeout: this.timeout,
    };

    if (this.auth && this.auth.username && this.auth.password) {
      config.auth = this.auth;
    } else if (this.auth && this.auth.token) {
      config.headers.Authorization = 'Token ' + this.auth.token;
    }

    if (this.contentType === 'application/octet-stream') {
      config.responseType = 'blob';
    }

    return config;
  }

  /**
   * Internal method to make an axios request.
   *
   * @param {Object} config - axios configuration object
   * @return {Object} - JS Promise, resolves to an ``axios reponse`` object
   */
  static _callAxios(config) {
    return axios(config)
      .then(response => {
        return response;
      })
      .catch(error => {
        Request._handleRequestError(error);
      });
  }

  /**
   * Internal method to handle errors produced by HTTP requests.
   *
   * @param {Object} error - axios error object
   * @throws {RequestException} throw error
   */
  static _handleRequestError(error) {
    let errMsg;

    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      //console.log(error.response.data);
      //console.log(error.response.status);
      //console.log(error.response.headers);
      errMsg = error.response;
      if (error.response.data.collection) {
        errMsg = Collection.getErrorMessage(error.response.data.collection);
      }
    } else if (error.request) {
      // The request was made but no response was received
      // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
      // http.ClientRequest in node.js
      //console.log(error.request);
      errMsg = error.request;
    } else {
      // Something happened in setting up the request that triggered an Error
      //console.log('Error', error.message);
      errMsg = error.message;
    }

    throw new RequestException(errMsg);
    //console.log(error.config);
  }

  /**
   * Helper method to run an asynchronous task defined by a task generator function.
   *
   * @param {function*()} taskGenerator - generator function
   */
  static runAsyncTask(taskGenerator) {
    // create the iterator
    let task = taskGenerator();
    // start the task
    let result = task.next();

    // recursive function to iterate through
    (function step() {
      // if there's more to do (result.value and result.done are iterator's properties)
      if (!result.done) {
        result.value
          .then(resp => {
            result = task.next(resp); // send this resp value to the yield
            step();
          })
          .catch(error => {
            result = task.throw(error); // throws error within taskGenerator generator
            step();
          });
      }
    })(); // start the recursive process by calling it immediatly
  }
}
