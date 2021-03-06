/** * Imports ***/
import Request from './request';
import { ItemResource } from './resource';

/**
 * Note item resource object.
 */
export default class Note extends ItemResource {
  /**
   * Constructor
   *
   * @param {string} url - url of the resource
   * @param {Object} auth - authentication object
   * @param {string} auth.token - authentication token
   */
  constructor(url, auth) {
    super(url, auth);
  }

  /**
   * Update this note.
   *
   * @param {Object} data - note data object
   * @param {string} data.title - note title
   * @param {string} data.content - note content
   * @param {number} [timeout=30000] - request timeout
   * @return {Object} - JS Promise, resolves to this ``Note`` object
   */
  update(data, timeout = 30000) {
    const url = this.url;
    const req = new Request(this.auth, this.contentType, timeout);
    const self = this;

    return new Promise((resolve, reject) => {
      const userData = {
        template: {
          data: [{ name: 'title', value: data.title }, { name: 'content', value: data.content }],
        },
      };

      const result = req.put(url, userData);

      result
        .then(response => {
          if (response.data && response.data.collection) {
            self.collection = response.data.collection;
          }
          resolve(self);
        })
        .catch(error => {
          reject(error);
        });
    });
  }
}
