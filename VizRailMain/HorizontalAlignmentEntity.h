#pragma once
#include "../VizRailCore/includes/HorizontalAlignment.h"


namespace VizRailCore
{
	class Curve;
	class IntermediateLine;
}

class HorizontalAlignmentEntity final : public AcDbEntity
{
public:
	ACRX_DECLARE_MEMBERS(HorizontalAlignmentEntity)
	HorizontalAlignmentEntity() = default;
	explicit HorizontalAlignmentEntity(const AcString& name, const std::vector<Jd>& jds);
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

public:
	[[nodiscard]] VizRailCore::HorizontalAlignment HorizontalAlignment() const
	{
		return _horizontalAlignment;
	}

	[[nodiscard]] AcString Name() const
	{
		return _name;
	}

private:
	VizRailCore::HorizontalAlignment _horizontalAlignment;
	static bool DrawHectoMeter(const AcGiWorldDraw* pWorldDraw,
	                           const std::shared_ptr<VizRailCore::LineElement>& line,
	                           const double startMileage, const double endMileage);
	static bool DrawIntermediateLine(const AcGiWorldDraw* pWorldDraw,
	                                 const std::shared_ptr<VizRailCore::IntermediateLine>& jzx);
	static bool MileageMark(const AcGiWorldDraw* pWorldDraw, const AcGePoint3d& pt,
	                        const VizRailCore::Angle& azimuthAngle, const AcString& str);
	static bool DrawCurve(const AcGiWorldDraw* pWorldDraw, const std::shared_ptr<VizRailCore::Curve>& qx);

	static bool DrawJdMark(AcGiWorldDraw* pWorldDraw, const std::shared_ptr<VizRailCore::Curve>& qx);
	AcString _name;
};
