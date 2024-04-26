#pragma once
#include "../VizRailCore/includes/HorizontalAlignment.h"


class HorizontalAlignmentEntity final : public AcDbEntity
{
public:
	ACRX_DECLARE_MEMBERS(HorizontalAlignmentEntity)
	HorizontalAlignmentEntity() = default;
	explicit HorizontalAlignmentEntity(const AcString& name,const std::vector<Jd>& jds);
	~HorizontalAlignmentEntity() override = default;


	Acad::ErrorStatus dwgInFields(AcDbDwgFiler* filer) override;
	Acad::ErrorStatus dwgOutFields(AcDbDwgFiler* filer) const override;
	Acad::ErrorStatus dxfInFields(AcDbDxfFiler* filer) override;
	Acad::ErrorStatus dxfOutFields(AcDbDxfFiler* filer) const override;

protected:
	Adesk::Boolean subWorldDraw(AcGiWorldDraw* pWorldDraw) override;
	Acad::ErrorStatus subTransformBy(const AcGeMatrix3d& xform) override;
	Acad::ErrorStatus subGetTransformedCopy(const AcGeMatrix3d& xform, AcDbEntity*& pEnt) const override;
	Acad::ErrorStatus subGetGripPoints(AcGePoint3dArray& gripPoints, AcDbIntArray& osnapModes,
	                                   AcDbIntArray& geomIds) const override;
	Acad::ErrorStatus subMoveGripPointsAt(const AcDbIntArray& indices, const AcGeVector3d& offset) override;
	Acad::ErrorStatus subGetGeomExtents(AcDbExtents& extents) const override;

private:
	VizRailCore::HorizontalAlignment _horizontalAlignment;
	AcString _name;
};
