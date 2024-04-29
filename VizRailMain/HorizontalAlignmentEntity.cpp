#include "stdafx.h"
#include "HorizontalAlignmentEntity.h"

#include <format>

#include "../VizRailCore/includes/Curve.h"
#include "../VizRailCore/includes/Exceptions.h"
#include "../VizRailCore/includes/IntermediateLine.h"


ACRX_DXF_DEFINE_MEMBERS(HorizontalAlignmentEntity, AcDbEntity,
                        AcDb::kDHL_CURRENT, AcDb::kMReleaseCurrent, 0, HORIZONTAL, /*MSG0*/"AutoCAD")

HorizontalAlignmentEntity::HorizontalAlignmentEntity(const AcString& name, const std::vector<Jd>& jds)
{
	_name = name;
	_horizontalAlignment.AddJd(jds);
}

Acad::ErrorStatus HorizontalAlignmentEntity::dwgInFields(AcDbDwgFiler* filer)
{
	assertWriteEnabled();
	if (const Acad::ErrorStatus es = AcDbEntity::dwgInFields(filer); es != Acad::eOk)
	{
		return es;
	}

	if (filer->filerType() == AcDb::kWblockCloneFiler)
	{
		AcDbHardPointerId id;
		filer->readHardPointerId(&id);
	}

	filer->readItem(_name);
	int size = 0;
	filer->readItem(&size);
	std::vector<Jd> jds(size);
	filer->readItem(jds.data(), size * sizeof(Jd));
	_horizontalAlignment.AddJd(jds);

	return filer->filerStatus();
}

Acad::ErrorStatus HorizontalAlignmentEntity::dwgOutFields(AcDbDwgFiler* filer) const
{
	assertReadEnabled();
	if (const Acad::ErrorStatus es = AcDbEntity::dwgOutFields(filer); es != Acad::eOk)
	{
		return es;
	}
	if (filer->filerType() == AcDb::kWblockCloneFiler)
	{
		filer->writeHardPointerId(ownerId());
	}

	filer->writeItem(_name);
	const std::vector<Jd> jds = _horizontalAlignment.GetJds();
	filer->writeItem(static_cast<int>(jds.size()));
	filer->writeItem(jds.data(), jds.size() * sizeof(Jd));

	return filer->filerStatus();
}

Acad::ErrorStatus HorizontalAlignmentEntity::dxfInFields(AcDbDxfFiler* filer)
{
	return Acad::eOk;
}

Acad::ErrorStatus HorizontalAlignmentEntity::dxfOutFields(AcDbDxfFiler* filer) const
{
	return Acad::eOk;
}

Adesk::Boolean HorizontalAlignmentEntity::subWorldDraw(AcGiWorldDraw* pWorldDraw)
{
	try
	{
		pWorldDraw->subEntityTraits().setLineWeight(AcDb::kLnWt050);

		const auto xys = _horizontalAlignment.GetXys();
		const auto xysOrder = _horizontalAlignment.GetXysOrder();

		AcGeVector3d normal(0, 0, 1);
		for (size_t i = 0; i < xysOrder.size(); ++i)
		{
			auto xyName = xysOrder[i];
			const auto xy = xys.at(xyName);
			if (xyName.find(L"夹直线") != -1)
			{
				const auto jzx = std::dynamic_pointer_cast<VizRailCore::IntermediateLine>(xy);
				const auto startPoint = jzx->StartPoint();
				const auto endPoint = jzx->EndPoint();
				pWorldDraw->subEntityTraits().setColor(3);
				AcGePoint3dArray tmp(2);
				tmp.append({startPoint.X(), startPoint.Y(), 0});
				tmp.append({endPoint.X(), endPoint.Y(), 0});
				pWorldDraw->geometry().polyline(2, tmp.asArrayPtr());

				// 直线百米标
				for (int i =static_cast<int>(jzx->StartMileage().Value()); i < jzx->EndMileage().Value(); i += 100)
				{
					const auto coordinate = jzx->MileageToCoordinate(i);
					const auto azimuthAngle = jzx->MileageToAzimuthAngle(i);
					AcGePoint3dArray tmp1(2);
					const double dx = 10 * VizRailCore::Angle::Cos(azimuthAngle - VizRailCore::Angle::HalfPi());
					const double dy = 10 * VizRailCore::Angle::Sin(azimuthAngle - VizRailCore::Angle::HalfPi());
					tmp1[0] = {coordinate.X(), coordinate.Y(), 0};
					tmp1[1] = {coordinate.X() + dx, coordinate.Y() + dy, 0};
					pWorldDraw->geometry().polyline(2, tmp1.asArrayPtr());
					AcGeVector3d direction(dx, dy, 0);
					pWorldDraw->geometry().text(tmp1[1], normal, direction, 7.0, 1,
					                            0, VizRailCore::Mileage(i).GetString().c_str());
				}
			}
			else if (xyName.find(L"曲线") != -1)
			{
				const auto qx = std::dynamic_pointer_cast<VizRailCore::Curve>(xy);
				const auto& mileageZH = qx->K(VizRailCore::SpecialPoint::ZH);
				const auto& mileageHY = qx->K(VizRailCore::SpecialPoint::HY);
				const auto& mileageYH = qx->K(VizRailCore::SpecialPoint::YH);
				const auto& mileageHZ = qx->K(VizRailCore::SpecialPoint::HZ);
				AcGePoint3dArray transitionTmp1;
				AcGePoint3dArray transitionTmp2;
				AcGePoint3dArray curveTmp;
				const auto ZH = qx->MileageToCoordinate(mileageZH);
				const auto HY = qx->MileageToCoordinate(mileageHY);
				const auto YH = qx->MileageToCoordinate(mileageYH);
				const auto HZ = qx->MileageToCoordinate(mileageHZ);

				// 前缓和曲线
				for (double j = mileageZH.Value(); j < mileageHY.Value(); j += 1.0)
				{
					const auto coordinate = qx->MileageToCoordinate(j);
					transitionTmp1.append({coordinate.X(), coordinate.Y(), 0});
				}
				transitionTmp1.append({HY.X(), HY.Y(), 0});

				// 圆曲线部分
				for (double j = mileageHY.Value(); j < mileageYH.Value(); j += 1.0)
				{
					const auto coordinate = qx->MileageToCoordinate(j);
					curveTmp.append({coordinate.X(), coordinate.Y(), 0});
				}
				curveTmp.append({YH.X(), YH.Y(), 0});

				// 后缓和曲线
				for (double j = mileageYH.Value(); j < mileageHZ.Value(); j += 1.0)
				{
					const auto coordinate = qx->MileageToCoordinate(j);
					transitionTmp2.append({coordinate.X(), coordinate.Y(), 0});
				}
				transitionTmp2.append({HZ.X(), HZ.Y(), 0});

				// 绘图
				pWorldDraw->subEntityTraits().setColor(2);
				pWorldDraw->geometry().polyline(transitionTmp1.length(), transitionTmp1.asArrayPtr());
				pWorldDraw->geometry().polyline(transitionTmp2.length(), transitionTmp2.asArrayPtr());

				pWorldDraw->subEntityTraits().setColor(1);
				pWorldDraw->geometry().polyline(curveTmp.length(), curveTmp.asArrayPtr());
			}
		}

		pWorldDraw->subEntityTraits().setColor(3);
		pWorldDraw->subEntityTraits().setLineWeight(AcDb::kLnWt025);
		const auto jds = _horizontalAlignment.GetJds();
		int jdSize = static_cast<int>(jds.size());
		AcGePoint3dArray jdPoints(jdSize);
		for (int i = 0; i < jdSize; ++i)
		{
			AcGePoint3d point(jds[i].E, jds[i].N, 0);
			AcGeVector3d normal(0, 0, 1);
			AcGeVector3d direction(1, 0, 0);
			pWorldDraw->geometry().circle(point, 3, normal);
			pWorldDraw->geometry().text(point, normal, direction, 7.0, 1, 0,
			                            std::format(L"JD{}", jds[i].JdH).c_str());
			jdPoints[i] = {jds[i].E, jds[i].N, 0};
		}

		const auto ret = pWorldDraw->geometry().polyline(jdPoints.length(), jdPoints.asArrayPtr());
		return true;
	}
	catch (const std::invalid_argument& e)
	{
		acutPrintf(L"%s", e.what());
		return false;
	}
	catch (NotInLineException& e)
	{
		acutPrintf(L"%s", e.GetMsg().c_str());
		return false;
	}
	catch (VizRailCoreException& e)
	{
		acutPrintf(L"%s", e.GetMsg().c_str());
		return false;
	}
	catch (std::exception& e)
	{
		acutPrintf(L"%s", e.what());
		return false;
	}
	catch (...)
	{
		acutPrintf(L"未知错误");
		return false;
	}
}

Acad::ErrorStatus HorizontalAlignmentEntity::subTransformBy(const AcGeMatrix3d& xform)
{
	return Acad::eOk;
}

Acad::ErrorStatus HorizontalAlignmentEntity::subGetTransformedCopy(const AcGeMatrix3d& xform, AcDbEntity*& pEnt) const
{
	return Acad::eOk;
}

Acad::ErrorStatus HorizontalAlignmentEntity::subGetGripPoints(AcGePoint3dArray& gripPoints, AcDbIntArray& osnapModes,
                                                              AcDbIntArray& geomIds) const
{
	const auto jds = _horizontalAlignment.GetJds();
	for (size_t i = 0; i < jds.size(); i++)
	{
		gripPoints.append(AcGePoint3d(jds[i].E, jds[i].N, 0));
		osnapModes.append(0);
		geomIds.append(static_cast<int>(i));
	}
	return Acad::eOk;
}

Acad::ErrorStatus HorizontalAlignmentEntity::subMoveGripPointsAt(const AcDbIntArray& indices,
                                                                 const AcGeVector3d& offset)
{
	const auto jds = _horizontalAlignment.GetJds();
	try
	{
		for (const auto& i : indices)
		{
			_horizontalAlignment.MoveJd(i, offset.y, offset.x);
		}
	}
	catch (const VizRailCoreException& e)
	{
		acutPrintf(L"%s", e.GetMsg().c_str());
		return Acad::eInvalidInput;
	}
	catch (const std::exception& e)
	{
		acutPrintf(L"%s", e.what());
		return Acad::eInvalidInput;
	}catch (...)
	{
		acutPrintf(L"未知错误");
		return Acad::eInvalidInput;
	}
	return Acad::eOk;
}

Acad::ErrorStatus HorizontalAlignmentEntity::subGetGeomExtents(AcDbExtents& extents) const
{
	return Acad::eOk;
}
