const AppError = require('./appError')

class APIFeatures {
    constructor(query, reqQuery) {
        this.query = query
        this.reqQuery = reqQuery
    }

    filter() {
        let queryObj = { ...this.reqQuery }
        const excludedFields = ['page', 'sort', 'limit', 'fields']
        excludedFields.forEach(field => delete queryObj[field])

        let queryStr = JSON.stringify(queryObj)
        queryStr = queryStr.replace(/\b(gte|gt|le|lte)\b/g, match => `$${match}`)
        this.query.find(JSON.parse(queryStr))

        return this
    }

    sort() {
        if (this.reqQuery.sort) {
            const sortBy = this.reqQuery.sort.split(',').join(' ')
            this.query = this.query.sort(sortBy)
        } else {
            this.query = this.query.sort('-createdAt')
        }

        return this
    }

    selectFields() {
        if (this.reqQuery.fields) {
            const fields = this.reqQuery.fields.split(',').join(' ')
            this.query = this.query.select(fields) // Ex.: query = query.select('name duration price')
        } else {
            this.query = this.query.select('-__v') // using '-' on select() exclude the specific item passed as params on projection
        }

        return this
    }

    paginate(numTours) {
        const page = this.reqQuery.page * 1 || 1 // * 1 convert String to Number
        const limit = this.reqQuery.limit * 1 || 100
        const skip = (page - 1) * limit;

        this.query = this.query.skip(skip).limit(limit) // page=3&limit=10, 1-10->page 1, 11-20->page 2, 21-30->page 3
        if (this.reqQuery.page) {
            if (skip >= numTours) throw new AppError('This page does not exist', 404)
        }

        return this
    }
}

module.exports = APIFeatures;
