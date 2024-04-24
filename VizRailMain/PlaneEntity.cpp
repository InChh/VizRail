#include "stdafx.h"
#include "PlaneEntity.h"


ACRX_DEFINE_MEMBERS(PlaneEntity)

PlaneEntity::PlaneEntity()
{
}

PlaneEntity::~PlaneEntity()
{
}

Acad::ErrorStatus PlaneEntity::dwgInFields(AcDbDwgFiler* filer)
{
}

Acad::ErrorStatus PlaneEntity::dwgOutFields(AcDbDwgFiler* filer) const
{
}

Acad::ErrorStatus PlaneEntity::dxfInFields(AcDbDxfFiler* filer)
{
}

Acad::ErrorStatus PlaneEntity::dxfOutFields(AcDbDxfFiler* filer) const
{
}

Adesk::Boolean PlaneEntity::subWorldDraw(AcGiWorldDraw* pWorldDraw)
{
}

Acad::ErrorStatus PlaneEntity::subTransformBy(const AcGeMatrix3d& xform)
{
}

Acad::ErrorStatus PlaneEntity::subGetTransformedCopy(const AcGeMatrix3d& xform, AcDbEntity*& pEnt) const
{
}

Acad::ErrorStatus PlaneEntity::subGetGripPoints(AcGePoint3dArray& gripPoints, AcDbIntArray& osnapModes,
                                                AcDbIntArray& geomIds) const
{
}

Acad::ErrorStatus PlaneEntity::subMoveGripPointsAt(const AcDbIntArray& indices, const AcGeVector3d& offset)
{
}

Acad::ErrorStatus PlaneEntity::subGetGeomExtents(AcDbExtents& extents) const
{
}
