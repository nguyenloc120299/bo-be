"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Sample_1 = require("../model/Sample");
async function findById(id) {
    return Sample_1.SampleModel.findOne({ _id: id, status: true }).lean().exec();
}
async function create(sample) {
    const now = new Date();
    sample.createdAt = now;
    sample.updatedAt = now;
    const created = await Sample_1.SampleModel.create(sample);
    return created.toObject();
}
async function update(sample) {
    sample.updatedAt = new Date();
    return Sample_1.SampleModel.findByIdAndUpdate(sample._id, sample, { new: true })
        .lean()
        .exec();
}
exports.default = {
    findById,
    create,
    update,
};
//# sourceMappingURL=SampleRepo.js.map