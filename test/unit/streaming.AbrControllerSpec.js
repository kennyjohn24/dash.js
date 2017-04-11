import SpecHelper from './helpers/SpecHelper';
import VoHelper from './helpers/VOHelper';
import ObjectsHelper from './helpers/ObjectsHelper';
import AbrController from '../../src/streaming/controllers/AbrController';

const expect = require('chai').expect;

describe("AbrController", function () {
    const context = {};
    const testType = 'video';
    const voHelper = new VoHelper();
    const objectsHelper = new ObjectsHelper();
    const defaultQuality = AbrController.QUALITY_DEFAULT;
    const abrCtrl = AbrController(context).getInstance();
    const dummyMediaInfo = voHelper.getDummyMediaInfo(testType);
    const representationCount = dummyMediaInfo.representationCount;
    const streamProcessor = objectsHelper.getDummyStreamProcessor(testType);

    abrCtrl.registerStreamProcessor('video', streamProcessor);

    it("should update top quality index", function () {
        const expectedTopQuality = representationCount - 1;
        let actualTopQuality;

        actualTopQuality = abrCtrl.updateTopQualityIndex(dummyMediaInfo);

        expect(actualTopQuality).to.be.equal(expectedTopQuality);
    });

    it("should set a quality in a range between zero and a top quality index", function () {
        const testQuality = 1;
        let newQuality;

        abrCtrl.setPlaybackQuality(testType, dummyMediaInfo.streamInfo, testQuality);
        newQuality = abrCtrl.getQualityFor(testType);
        expect(newQuality).to.be.equal(testQuality);
    });

    it("should throw an exception when attempting to set not a number value for a quality", function () {
        let testQuality = 'a';
        expect(abrCtrl.setPlaybackQuality.bind(abrCtrl, testType, dummyMediaInfo.streamInfo, testQuality)).to.throw("argument is not an integer");

        testQuality = null;
        expect(abrCtrl.setPlaybackQuality.bind(abrCtrl, testType, dummyMediaInfo.streamInfo, testQuality)).to.throw("argument is not an integer");

        testQuality = 2.5;
        expect(abrCtrl.setPlaybackQuality.bind(abrCtrl, testType, dummyMediaInfo.streamInfo, testQuality)).to.throw("argument is not an integer");

        testQuality = {};
        expect(abrCtrl.setPlaybackQuality.bind(abrCtrl, testType, dummyMediaInfo.streamInfo, testQuality)).to.throw("argument is not an integer");
    });

    it("should ignore an attempt to set a negative quality value", function () {
        const negativeQuality = -1;
        const oldQuality = abrCtrl.getQualityFor(testType);
        let newQuality;

        abrCtrl.setPlaybackQuality(testType, dummyMediaInfo.streamInfo, negativeQuality);
        newQuality = abrCtrl.getQualityFor(testType);
        expect(newQuality).to.be.equal(oldQuality);
    });

    it("should ignore an attempt to set a quality greater than top quality index", function () {
        const greaterThanTopQualityValue = representationCount;
        const oldQuality = abrCtrl.getQualityFor(testType);
        let newQuality;

        abrCtrl.setPlaybackQuality(testType, dummyMediaInfo.streamInfo, greaterThanTopQualityValue);
        newQuality = abrCtrl.getQualityFor(testType);

        expect(newQuality).to.be.equal(oldQuality);
    });

    it("should restore a default quality value after reset", function () {
        const testQuality = 1;
        let newQuality;

        abrCtrl.setPlaybackQuality(testType, dummyMediaInfo.streamInfo, testQuality);
        abrCtrl.reset();
        newQuality = abrCtrl.getQualityFor(testType);
        expect(newQuality).to.be.equal(defaultQuality);
    });

    it("should compose a list of available bitrates", function () {
        const expectedBitrates = dummyMediaInfo.bitrateList;
        const actualBitrates = abrCtrl.getBitrateList(dummyMediaInfo);
        let item,
            match;

        match = expectedBitrates.filter(function(val, idx) {
            item = actualBitrates[idx];
            return (item && (item.qualityIndex === idx) && (item.bitrate === val.bandwidth) && (item.mediaType === dummyMediaInfo.type) && (item.width === val.width) && (item.height === val.height));
        });

        expect(match.length).to.be.equal(expectedBitrates.length);
    });
});
