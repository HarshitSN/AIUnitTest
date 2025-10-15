/**
 * Advanced Data Processor Module
 * A comprehensive data processing utility with validation, transformation, and analysis capabilities
 * Designed to test AI-powered unit test generation pipelines
 */

class DataProcessor {
  /**
   * Validates if the input is a valid array
   * @param {any} data - The data to validate
   * @returns {boolean} - True if valid array, false otherwise
   */
  static validateArray(data) {
    if (!Array.isArray(data)) {
      return false;
    }
    return data.length > 0;
  }

  /**
   * Validates numeric data with comprehensive checks
   * @param {any} value - The value to validate
   * @param {Object} options - Validation options
   * @param {boolean} options.allowNegative - Allow negative numbers
   * @param {boolean} options.allowZero - Allow zero values
   * @param {boolean} options.allowFloat - Allow floating point numbers
   * @param {number} options.maxValue - Maximum allowed value
   * @param {number} options.minValue - Minimum allowed value
   * @returns {Object} - Validation result with isValid boolean and error message
   */
  static validateNumeric(value, options = {}) {
    const {
      allowNegative = true,
      allowZero = true,
      allowFloat = true,
      maxValue = Infinity,
      minValue = -Infinity,
    } = options;

    // Basic type check
    if (typeof value !== 'number' && !allowFloat) {
      return { isValid: false, error: 'Value must be a number' };
    }

    if (typeof value !== 'number' && typeof value !== 'string') {
      return { isValid: false, error: 'Value must be numeric' };
    }

    // Convert string numbers
    const numValue = typeof value === 'string' ? parseFloat(value) : value;

    if (isNaN(numValue)) {
      return { isValid: false, error: 'Value must be a valid number' };
    }

    // Check for negative values
    if (!allowNegative && numValue < 0) {
      return { isValid: false, error: 'Negative values are not allowed' };
    }

    // Check for zero values
    if (!allowZero && numValue === 0) {
      return { isValid: false, error: 'Zero values are not allowed' };
    }

    // Check for floating point when not allowed
    if (!allowFloat && numValue % 1 !== 0) {
      return { isValid: false, error: 'Floating point numbers are not allowed' };
    }

    // Check range constraints
    if (numValue > maxValue) {
      return { isValid: false, error: `Value exceeds maximum allowed value of ${maxValue}` };
    }

    if (numValue < minValue) {
      return { isValid: false, error: `Value below minimum allowed value of ${minValue}` };
    }

    return { isValid: true, error: null };
  }

  /**
   * Filters an array based on multiple criteria
   * @param {Array} data - The array to filter
   * @param {Object} criteria - Filter criteria
   * @param {Function} criteria.predicate - Custom predicate function
   * @param {number} criteria.minValue - Minimum numeric value
   * @param {number} criteria.maxValue - Maximum numeric value
   * @param {Array} criteria.allowedValues - Array of allowed values
   * @returns {Array} - Filtered array
   */
  static filterData(data, criteria = {}) {
    if (!this.validateArray(data)) {
      throw new Error('Input must be a non-empty array');
    }

    const { predicate, minValue, maxValue, allowedValues } = criteria;

    return data.filter((item) => {
      // Apply custom predicate if provided
      if (predicate && typeof predicate === 'function') {
        if (!predicate(item)) return false;
      }

      // Apply numeric range filters
      if (typeof item === 'number') {
        if (minValue !== undefined && item < minValue) return false;
        if (maxValue !== undefined && item > maxValue) return false;
      }

      // Apply allowed values filter
      if (allowedValues && Array.isArray(allowedValues)) {
        if (!allowedValues.includes(item)) return false;
      }

      return true;
    });
  }

  /**
   * Transforms data using various transformation strategies
   * @param {Array} data - The array to transform
   * @param {string} strategy - Transformation strategy ('normalize', 'standardize', 'scale', 'log')
   * @param {Object} options - Transformation options
   * @returns {Array} - Transformed array
   */
  static transformData(data, strategy, options = {}) {
    if (!this.validateArray(data)) {
      throw new Error('Input must be a non-empty array');
    }

    const numericData = data.filter((item) => typeof item === 'number' && !isNaN(item));

    if (numericData.length === 0) {
      throw new Error('No valid numeric data found for transformation');
    }

    switch (strategy) {
      case 'normalize':
        return this.normalizeData(numericData, options);
      case 'standardize':
        return this.standardizeData(numericData, options);
      case 'scale':
        return this.scaleData(numericData, options);
      case 'log':
        return this.logTransform(numericData, options);
      default:
        throw new Error(`Unknown transformation strategy: ${strategy}`);
    }
  }

  /**
   * Normalizes data to 0-1 range
   * @param {Array} data - Numeric data array
   * @param {Object} options - Normalization options
   * @returns {Array} - Normalized data
   */
  static normalizeData(data, options = {}) {
    const { minRange = 0, maxRange = 1 } = options;

    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min;

    if (range === 0) {
      return data.map(() => (minRange + maxRange) / 2);
    }

    return data.map((value) => {
      const normalized = (value - min) / range;
      return minRange + normalized * (maxRange - minRange);
    });
  }

  /**
   * Standardizes data (z-score normalization)
   * @param {Array} data - Numeric data array
   * @param {Object} options - Standardization options
   * @returns {Array} - Standardized data
   */
  static standardizeData(data) {
    const mean = data.reduce((sum, val) => sum + val, 0) / data.length;
    const variance = data.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / data.length;
    const stdDev = Math.sqrt(variance);

    if (stdDev === 0) {
      return data.map(() => 0);
    }

    return data.map((value) => (value - mean) / stdDev);
  }

  /**
   * Scales data by a factor
   * @param {Array} data - Numeric data array
   * @param {Object} options - Scaling options
   * @returns {Array} - Scaled data
   */
  static scaleData(data, options = {}) {
    const { factor = 1, offset = 0 } = options;

    if (typeof factor !== 'number' || typeof offset !== 'number') {
      throw new Error('Scale factor and offset must be numbers');
    }

    return data.map((value) => value * factor + offset);
  }

  /**
   * Applies logarithmic transformation
   * @param {Array} data - Numeric data array
   * @param {Object} options - Log transformation options
   * @returns {Array} - Log transformed data
   */
  static logTransform(data, options = {}) {
    const { base = Math.E, handleNegative = 'error' } = options;

    if (!['error', 'absolute', 'shift'].includes(handleNegative)) {
      throw new Error('handleNegative must be one of: error, absolute, shift');
    }

    return data.map((value) => {
      if (value <= 0) {
        switch (handleNegative) {
          case 'absolute':
            return Math.log(Math.abs(value) + 1) / Math.log(base);
          case 'shift':
            return Math.log(value + Math.abs(Math.min(...data)) + 1) / Math.log(base);
          default:
            throw new Error('Log transformation requires positive values');
        }
      }

      return Math.log(value) / Math.log(base);
    });
  }

  /**
   * Calculates statistical measures
   * @param {Array} data - Numeric data array
   * @param {Array} measures - Array of measure names to calculate
   * @returns {Object} - Object containing calculated measures
   */
  static calculateStats(data, measures = ['mean', 'median', 'mode', 'std', 'min', 'max', 'range']) {
    if (!this.validateArray(data)) {
      throw new Error('Input must be a non-empty array');
    }

    const numericData = data.filter((item) => typeof item === 'number' && !isNaN(item));

    if (numericData.length === 0) {
      throw new Error('No valid numeric data found for statistical calculations');
    }

    const results = {};

    if (measures.includes('mean')) {
      results.mean = numericData.reduce((sum, val) => sum + val, 0) / numericData.length;
    }

    if (measures.includes('min')) {
      results.min = Math.min(...numericData);
    }

    if (measures.includes('max')) {
      results.max = Math.max(...numericData);
    }

    if (measures.includes('range') && results.min !== undefined && results.max !== undefined) {
      results.range = results.max - results.min;
    }

    if (measures.includes('median')) {
      const sorted = [...numericData].sort((a, b) => a - b);
      const mid = Math.floor(sorted.length / 2);
      results.median = sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
    }

    if (measures.includes('mode')) {
      const frequency = {};
      numericData.forEach((val) => {
        frequency[val] = (frequency[val] || 0) + 1;
      });

      let maxFreq = 0;
      let modes = [];

      Object.entries(frequency).forEach(([val, freq]) => {
        if (freq > maxFreq) {
          maxFreq = freq;
          modes = [parseFloat(val)];
        } else if (freq === maxFreq) {
          modes.push(parseFloat(val));
        }
      });

      results.mode = modes.length === numericData.length ? null : modes;
    }

    if (measures.includes('std')) {
      const mean = results.mean;
      const variance =
        numericData.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / numericData.length;
      results.std = Math.sqrt(variance);
    }

    return results;
  }

  /**
   * Groups data by a key function or property
   * @param {Array} data - The array to group
   * @param {Function|string} keyFn - Key function or property name
   * @returns {Object} - Grouped data object
   */
  static groupBy(data, keyFn) {
    if (!this.validateArray(data)) {
      throw new Error('Input must be a non-empty array');
    }

    if (typeof keyFn !== 'function' && typeof keyFn !== 'string') {
      throw new Error('keyFn must be a function or string property name');
    }

    return data.reduce((groups, item) => {
      const key = typeof keyFn === 'function' ? keyFn(item) : item[keyFn];

      if (!groups[key]) {
        groups[key] = [];
      }

      groups[key].push(item);
      return groups;
    }, {});
  }

  /**
   * Processes a batch of data operations
   * @param {Array} data - The data to process
   * @param {Array} operations - Array of operation objects
   * @returns {Array} - Processed data
   */
  static processBatch(data, operations) {
    if (!this.validateArray(data)) {
      throw new Error('Input must be a non-empty array');
    }

    if (!Array.isArray(operations)) {
      throw new Error('Operations must be an array');
    }

    let processedData = [...data];

    operations.forEach((operation, index) => {
      try {
        switch (operation.type) {
          case 'filter':
            processedData = this.filterData(processedData, operation.criteria);
            break;
          case 'transform':
            processedData = this.transformData(
              processedData,
              operation.strategy,
              operation.options
            );
            break;
          case 'group':
            processedData = this.groupBy(processedData, operation.keyFn);
            break;
          case 'stats':
            processedData = this.calculateStats(processedData, operation.measures);
            break;
          default:
            throw new Error(`Unknown operation type: ${operation.type}`);
        }
      } catch (error) {
        throw new Error(`Error in operation ${index + 1}: ${error.message}`);
      }
    });

    return processedData;
  }
}

export default DataProcessor;
export { DataProcessor };
