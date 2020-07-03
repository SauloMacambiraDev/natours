const asyncCatch = require('./../utils/asyncCatch')
const AppError = require('./../utils/appError')
const APIFeatures = require('./../utils/apiFeatures')

exports.getAll = Model => asyncCatch(async (req, res, next) => {
    // To allow for nested GET reviews on tour (hack)
    let filter = {}
    if (req.params.tourId) filter = { tour: req.params.tourId }

    let query = Model.find(filter)
    const features = new APIFeatures(query, req.query)


    const numDocs = await Model.countDocuments();

    try {
        query = features.filter().sort().selectFields().paginate(numDocs).query

        // const docs = await query.explain() // .explain() good to see the performance of an index in db
        const docs = await query

        return res.status(200).json({
            status: 'success',
            results: docs.length,
            data: {
                data: docs
            }
        })
    } catch (err) {
        return next(err)
    }
})

exports.getOne = (Model, popOptions) => asyncCatch(async (req, res, next) => {
    let query = await Model.findById(req.params.id)
    if (popOptions) query = query.populate(popOptions)

    const doc = await query

    if (!doc) return next(new AppError(`No document found with that ID`, 404))

    return res.status(200).json({
        status: 'success',
        data: {
            data: doc
        }
    })
})

exports.deleteOne = Model => asyncCatch(async (req, res, next) => {
    const { id } = req.params;
    const doc = await Model.findByIdAndDelete(id)

    if (!doc) return next(new AppError(`No document found with that ID`, 404))

    return res.status(204).json({
        message: 'success',
        data: null
    })
});


exports.updateOne = Model => asyncCatch(async (req, res, next) => {
    const { id } = req.params
    const doc = await Model.findByIdAndUpdate(id, req.body, {
        runValidators: true,
        new: true
    })

    if (!doc) return next(new AppError(`Wasn't possible to find the doc with that ID`, 404))

    return res.status(200).json({
        status: 'success',
        data: {
            data: doc
        }
    })

})

exports.createOne = Model => asyncCatch(async (req, res, next) => {
    const doc = await Model.create(req.body)

    res.status(201).json({
        status: 'success',
        data: {
            data: doc
        }
    })
})