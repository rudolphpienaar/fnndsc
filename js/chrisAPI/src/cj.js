/**
 * Collection+Json utility object.
 */
export default class Collection {
  /**
   * Get the error message from the collection object.
   *
   * @param {Object} collection - Collection+Json collection object
   * @return {string} - error message
   */
  static getErrorMessage(collection) {
    if (collection.error) {
      return collection.error.message;
    }
    return '';
  }

  /**
   * Get the list of urls for a link relation from a collection or item object.
   *
   * @param {Object} obj - Collection+Json collection or item object
   * @param {string} relationName - name of the link relation
   * @return {string[]} - list of urls
   */
  static getLinkRelationUrls(obj, relationName) {
    const links = obj.links.filter(link => {
      return link.rel === relationName;
    });
    return links.map(link => link.href);
  }

  /**
   * Get an item's data (descriptors).
   *
   * @param {Object} item - Collection+Json item object
   * @return {Object} - object whose properties and values are the item's descriptor names and values respectively
   */
  static getItemDescriptors(item) {
    const itemObj = {};

    // collect the item's descriptors
    for (let descriptor of item.data) {
      itemObj[descriptor.name] = descriptor.value;
    }
    return itemObj;
  }

  /**
   * Get the url of the representation given by a collection obj.
   *
   * @param {Object} collection
   * @return {string} url
   */
  static getUrl(collection) {
    return collection.href;
  }

  /**
   * Get the list of descriptor names within a collection's template object.
   *
   * @param {Object} template
   * @return {string[]} list of descriptor names
   */
  static getTemplateDescriptorNames(template) {
    return template.data.map(descriptor => descriptor.name);
  }
}
